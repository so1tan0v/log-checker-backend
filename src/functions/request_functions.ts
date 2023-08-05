import {FastifyReply, FastifyRequest} from "fastify";
import SFTPClient from "ssh2-sftp-client";
import {isEmpty} from "lodash";

import * as fs from "fs";
import * as nodeDate from 'date-and-time'
import * as crypto from 'crypto';

import {lpuList} from "../static/config";
import {ILpu, ILpuForFrontend, IQueryGetFile, IQuerySetFile} from "../interface";
import {copyObject, getLpuById} from "./helper";


/**
 * Метод возвращает все доступные ЛПУ для работы
 * @param request
 * @param reply
 */
export async function getAvailableLpu(request: FastifyRequest, reply: FastifyReply) {
    const lpuListForFrontend: Array<ILpuForFrontend> = [];

    lpuList.forEach(lpu => {
        let result: ILpuForFrontend = {
            titleName  : lpu.titleName,
            name       : lpu.name,
            category   : {}
        };

        let childElements: Array<ILpu> = [];
        if(lpu.childElements) {
            childElements = copyObject(lpu.childElements);
        }

        if(childElements && !isEmpty(childElements))
            result.childElements = childElements;

        for(let lpuType in lpu.category) {
            result.category[lpuType] = lpu.category[lpuType];
        }
        lpuListForFrontend.push(result);
    })

    reply.send(lpuListForFrontend);
}


/**
 * Метод возвращает запрошенный файл из сервера
 * @param request
 * @param reply
 */
export async function getFileByLpuIdAndType(request: FastifyRequest, reply: FastifyReply)  {
    let { id, fileType, lpuType } = request.query as IQueryGetFile;
    let selectedLpu = getLpuById(id);

    if(!selectedLpu || isEmpty(selectedLpu)) {
        reply
            .code(400)
            .send({
                error: "Не удалось найти ЛПУ"
            })
        return;
    }

    let client = new SFTPClient();
    let connect = selectedLpu!.connect;
    if(selectedLpu?.childElements && selectedLpu?.childElements[0]?.connect)
        connect = selectedLpu?.childElements[0]?.connect;

    try {
        await client.connect({
            host     : connect?.hostName,
            port     : connect?.port || 22,
            username : connect!.userName,
            password : connect!.password,
        })
    } catch (e) {
        reply
            .code(500)
            .send(e);

        return;
    }

    if(lpuType && fileType && selectedLpu.category && selectedLpu.category[lpuType] && selectedLpu.category[lpuType][fileType]) {
        try {
            let file = await client.get(selectedLpu.category[lpuType][fileType].path);

            reply.send(file.toLocaleString());
            return;
        } catch (e) {
            await client.end();
            throw e
        }
    } else {
        await client.end();
        reply
            .code(400)
            .send({
            error: "Не удалось найти файл"
        })
        return;
    }
}


/**
 * Метод отправляет файл на сервер
 * @param request
 * @param reply
 */
export async function sendNodeFile(request: FastifyRequest, reply: FastifyReply) {
    let {id, fileType, lpuType, fileContent} = request.body as IQuerySetFile;
    let selectedLpu = getLpuById(id);

    if(!selectedLpu || isEmpty(selectedLpu)) {
        reply
            .code(400)
            .send({
                error: "Не удалось найти ЛПУ"
            })
        return;
    }

    if(selectedLpu.readonly) {
        reply
            .code(400)
            .send({
                error: "Невозможно изменять файлы. Файл доступно только для чтения."
            })
        return;
    }

    const client = new SFTPClient(),
          connect = selectedLpu!.connect;

    try {
        await client.connect({
            host     : connect?.hostName,
            port     : connect?.port || 22,
            username : connect!.userName,
            password : connect!.password,
        })
    } catch (e) {
        reply
            .code(500)
            .send(e);

        return;
    }

    let tmpFileName = String(crypto.randomBytes(4).readUInt32LE(0));
    fs.writeFileSync(tmpFileName, fileContent ?? '');

    if(lpuType && fileType && selectedLpu.category && selectedLpu.category[lpuType] && selectedLpu.category[lpuType][fileType]) {
        const filePath = selectedLpu.category[lpuType][fileType].path,
              filePathTmpInServer = `${filePath}.tmp`,
              curDateTime = nodeDate.format(new Date(), 'YY-MM-DD@hh:mm:ss');

        try {
            await client.put(tmpFileName, filePathTmpInServer);

            await client.rename(filePath, filePath + `.bak-${curDateTime}`);
            await client.rename(filePathTmpInServer, filePath);

            await client.chmod(filePath, 0o777);
            await client.chmod(filePath + `.bak-${curDateTime}`, 0o777);
        } catch (e) {
            fs.unlinkSync(tmpFileName)
            await client.end();
            reply
                .code(500)
                .send(e);

            return;
        }
    } else {
        await client.end();
        fs.unlinkSync(tmpFileName);
        reply
            .code(400)
            .send({
            error: "Не удалось найти файл"
        })

        return;
    }

    fs.unlinkSync(tmpFileName);
    reply.send('Tonus');
}


export async function getFileByLpuIdAndTypeByChunk(request: FastifyRequest, reply: FastifyReply) {
    let { id, fileType, lpuType } = request.query as IQueryGetFile;
    let selectedLpu = getLpuById(id);

    if (!selectedLpu || isEmpty(selectedLpu)) {
        reply
            .code(400)
            .send({
                error: "Не удалось найти ЛПУ"
            });

        return;
    }

    let client = new SFTPClient();
    let connect = selectedLpu.connect;
    if (selectedLpu?.childElements && selectedLpu?.childElements[0]?.connect) {
        connect = selectedLpu?.childElements[0]?.connect;
    }

    try {
        await client.connect({
            host     : connect?.hostName,
            port     : connect?.port || 22,
            username : connect!.userName,
            password : connect!.password,
        });
    } catch (e) {
        reply
            .code(500)
            .send(e);

        return ;
    }

    let remoteFilePath: string;
    if (lpuType && fileType && selectedLpu.category && selectedLpu.category[lpuType] && selectedLpu.category[lpuType][fileType]) {
        remoteFilePath = selectedLpu.category[lpuType][fileType].path;
    } else {
        await client.end();
        reply
            .code(400)
            .send({
                error: "Не удалось найти файл"
            });

        return;
    }

    try {
        await client.stat(remoteFilePath);
        const readStream = client.createReadStream(remoteFilePath);

        reply.header('Content-Type', 'application/octet-stream');

        readStream.on('data', () => {
            reply.raw.write('');
        });

        readStream.on('end', () => {
            reply.raw.end();
            client.end();
        });

        readStream.on('error', (error: any) => {
            client.end();
            reply
                .status(500)
                .send({ success: false, message: 'Ошибка при чтении файла', error });
        });

        reply.send(readStream);
    } catch (error: any) {
        reply
            .status(500)
            .send({ success: false, message: error?.message, error });
    }

    return reply;
}