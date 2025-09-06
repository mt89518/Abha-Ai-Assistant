const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    userInput.value = '';

    const typingId = appendMessage('assistant', 'Typing...');

    try {
        const res = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: message })
        });

        const data = await res.json();

        // Replace typing indicator with actual response
        const typingMsg = document.getElementById(typingId);
        if (typingMsg) typingMsg.textContent = data.answer;
    } catch (err) {
        const typingMsg = document.getElementById(typingId);
        if (typingMsg) typingMsg.textContent = 'Error: Unable to get response.';
        console.error(err);
    }
});

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    const id = 'msg-' + Date.now() + Math.floor(Math.random() * 1000);
    msgDiv.id = id;
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}
