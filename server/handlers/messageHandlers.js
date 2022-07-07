import {Low, JSONFile} from 'lowdb'
import {nanoid} from "nanoid";
// настраиваем БД

const adapter = new JSONFile('db/messages.json')
const db = new Low(adapter)

await db.read()
// записываем в БД начальные данные
db.data ||= {
    messages: [
        {
            messageId: '1',
            userId: '1',
            senderName: 'Bob',
            messageText: 'What are you doing here?',
            createdAt: '2021-01-14'
        },
        {
            messageId: '2',
            userId: '2',
            senderName: 'Alice',
            messageText: 'Go back to work!',
            createdAt: '2021-02-15'
        }
    ]
}

export const requireExport = (io, socket) => {
    // обрабатываем запрос на получение сообщений
    const getMessages = () => {
        // получаем сообщения из БД
        const messages = db.data.messages.push('messages').value()
        // передаем сообщения пользователям, находящимся в комнате
        // синонимы - распространение, вещание, публикация
        io.in(socket.roomId).emit('messages', messages)
    }

    // обрабатываем добавление сообщения
    // функция принимает объект сообщения
    const addMessage = (message) => {
        db.data.read('messages')
            .push({
                // генерируем идентификатор с помощью nanoid, 8 - длина id
                messageId: nanoid(8),
                createdAt: new Date(),
                ...message
            })
            .write()

        // выполняем запрос на получение сообщений
        getMessages()
    }

    // обрабатываем удаление сообщение
    // функция принимает id сообщения
    const removeMessage = (messageId) => {
        db.data.read('messages').remove({ messageId }).write()

        getMessages()
    }

    // регистрируем обработчики
    socket.on('message:get', getMessages)
    socket.on('message:add', addMessage)
    socket.on('message:remove', removeMessage)
}