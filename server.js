const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); // Adicione esta linha
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
// Índice do slide atual
let currentSlideIndex = 1; 

// Rota para controle
app.get('/control', (req, res) => {
    res.sendFile(__dirname + '/public/control.html');
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/slides/slide1.html');
});

// Rota para visualização
app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/public/view.html');
});

// Socket.IO para comunicação em tempo real
io.on('connection', (socket) => {
    console.log('Um dispositivo conectou');

    // Envia o slide atual ao novo cliente
    socket.emit('updateSlide', currentSlideIndex);

    // Recebe o comando para mudar o slide do controlador
    socket.on('changeSlide', (slideIndex) => {
        currentSlideIndex = slideIndex;
        io.emit('updateSlide', currentSlideIndex); // Atualiza todos os clientes
    });

    socket.on('disconnect', () => {
        console.log('Um dispositivo desconectou');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
