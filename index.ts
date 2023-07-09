import fastify from 'fastify'

import {IQueryGetFile, IQuerySetFile} from "./interface";
import {
    getAvailableLpu,
    getFileByLpuIdAndType,
    getFileByLpuIdAndTypeNew,
    sendNodeFile
} from "./functions/request_functions";

const server = fastify()

server.get('/api/getAvailableLpu', getAvailableLpu)
server.get<{ Querystring: IQueryGetFile }>('/api/getFileByLpuIdAndType', getFileByLpuIdAndType);
server.get<{ Querystring: IQueryGetFile }>('/api/getFileByLpuIdAndTypeNew', getFileByLpuIdAndTypeNew);

server.post<{ Body: IQuerySetFile }>('/api/sendNodeFile', sendNodeFile)

server.listen({ port: 3145 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})