import { createServer } from "http";
import { Server } from "socket.io";
import {requireExport} from "./handlers/messageHandlers.js";
import {userHandlerExport} from "./handlers/userHandlers.js";
import chalk from "chalk";

const server = createServer()
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})



const onConnection = (socket) => {
    console.log(chalk.green('User connected'))

    const { roomId } = socket.handshake.query
    socket.roomId = roomId

    socket.join(roomId)

    requireExport(io, socket)
    userHandlerExport(io, socket)

    socket.on('disconnect', () => {
        console.log(chalk.redBright('User disconnected'))
        socket.leave(roomId)
    })
}

io.on('connection', onConnection)

const PORT = process.env.PORT || 5000
server.listen(5000, () => {
    console.log(chalk.greenBright(` ===== Server ready. Port: ${PORT} =====`))
})
