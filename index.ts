import fastify from 'fastify'
import {isEmpty} from "lodash";
import SFTPClient from "ssh2-sftp-client";

import * as nodeDate from 'date-and-time'
import * as fs from 'fs'
import * as crypto from 'crypto';

import {lpuList} from "./static/config";
import {decryptCyrillicLpuType, getLpuById, getLpuTypeTitleNameByAliasName} from "./helper";
import {ILpuChildForFrontend, ILpuForFrontend, IQueryGetFile, IQuerySetFile} from "./interface";

const server = fastify()



server.get('/api/getAvailableLpu', async (request, reply) => {
    const lpuListForFrontend: Array<ILpuForFrontend> = []
    lpuList.forEach(lpu => {
        let result: ILpuForFrontend = {
            titleName         : lpu.titleName,
            name              : lpu.name,
            availableLpuTypes : [],
            readonly          : lpu?.readonly ?? false
        };

        let childElements: Array<ILpuChildForFrontend> = [];
        if(lpu.childElements) {
            lpu.childElements?.forEach(childLpu => (
                childElements.push({
                    name      : childLpu.name,
                    titleName : childLpu.titleName
                })
            ))
        }
        if(childElements && !isEmpty(childElements))
            result.childElements = childElements;

        for(let lpuType in lpu.rootPath) {
            let lpuTypeTitleName = getLpuTypeTitleNameByAliasName(lpuType)
            result.availableLpuTypes.push(lpuTypeTitleName);
        }
        lpuListForFrontend.push(result);
    })

    reply.send(lpuListForFrontend);
})

server.get<{ Querystring: IQueryGetFile }>('/api/getFileByLpuIdAndType', async (request, reply) => {
    let {id, fileType, lpuType} = request.query;
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
    const connect = selectedLpu!.connect;
    try {
        await client.connect({
            host     : connect?.hostName,
            port     : connect?.port || 22,
            username : connect!.userName,
            password : connect!.password,
        })
    } catch (e) {
        throw e
    }
    let file;
    if(selectedLpu.rootPath && lpuType && selectedLpu.rootPath[decryptCyrillicLpuType(lpuType)]) {
        try {
            file = await client.get(selectedLpu.rootPath[decryptCyrillicLpuType(lpuType)] + '/' + (fileType === 'yaml' ? selectedLpu!.yamlRelativePath : selectedLpu!.errLoggerRelativePath));
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

    reply.send(file.toLocaleString());
})

server.post<{ Body: IQuerySetFile }>('/api/sendNodeFile', async (request, reply) => {
    let {id, fileType, lpuType, node} = request.body;
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
            error: "Невозможно изменять файлы. ЛПУ доступно только для чтения."
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
        throw e
    }
    let tmpFileName = String(crypto.randomBytes(4).readUInt32LE(0));
    fs.writeFileSync(tmpFileName, node ?? '');

    if(selectedLpu.rootPath && lpuType && selectedLpu.rootPath[decryptCyrillicLpuType(lpuType)]) {
        const filePath = selectedLpu.rootPath[decryptCyrillicLpuType(lpuType)] + '/' + (fileType === 'yaml' ? selectedLpu!.yamlRelativePath : selectedLpu!.errLoggerRelativePath),
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
            throw e
        }
    } else {
        await client.end();
        fs.unlinkSync(tmpFileName)
        reply
            .code(400)
            .send({
            error: "Не удалось найти файл"
        })
        return;
    }

    fs.unlinkSync(tmpFileName);
    reply.send('Tonus');
})

server.listen({ port: 3333 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})