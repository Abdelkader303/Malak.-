let conversationStarted = false;
let isSending = false; // متغير لتتبع حالة الإرسال

document.addEventListener('DOMContentLoaded', function() {
    if (conversationStarted) return;
    conversationStarted = true;
    
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    let currentQuestion = 0;
    let userData = {
        password: '',
        fullName: '',
        email: '',
        topicType: '',
        problem: ''
    };
    
    const questions = [
        {
            text: "مرحبا بك في قسم DESING لإرسال فكرتك أو موضوع آخر رجاءا الجواب على الأسئلة التي تطرح عليك وشكرا",
            isWelcome: true
        },
        {
            text: "أكتب كلمة المرور بأنك عضو في قسم Desing",
            field: 'password',
            validate: (value) => value.trim().toLowerCase() === 'malakn'
        },
        {
            text: "أكتب الإسم واللقب",
            field: 'fullName',
            validate: (value) => value.trim().length > 0
        },
        {
            text: "أكتب البريد الإلكتروني",
            field: 'email',
            inputType: 'email',
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        },
        {
            text: "ماهو الموضوع:",
            field: 'topicType',
            isOptions: true,
            options: ['أقترح فكرة', 'أواجه مشكلة', 'موضوع آخر'],
            validate: (value) => ['أقترح فكرة', 'أواجه مشكلة', 'موضوع آخر'].includes(value)
        },
        {
            text: "إطرح الموضوع بالتفصيل",
            field: 'problem',
            validate: (value) => value.trim().length > 10
        }
    ];
    
    // بدء المحادثة
    setTimeout(() => {
        addBotMessage(questions[0].text, true);
        setTimeout(() => askQuestion(1), 1000);
    }, 500);
    
    function addBotMessage(text, isWelcome = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        if (isWelcome) messageDiv.classList.add('welcome-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'user-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addErrorMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'error-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'bot-message');
        loadingDiv.innerHTML = '<span class="spinner"></span> جاري إرسال البيانات...';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loadingDiv;
    }
    
    function askQuestion(index) {
        currentQuestion = index;
        const question = questions[index];
        
        addBotMessage(question.text);
        
        if (question.inputType) {
            userInput.type = question.inputType;
        } else {
            userInput.type = 'text';
        }
        
        userInput.placeholder = question.text;
        userInput.focus();
        
        if (question.isOptions) {
            showOptions(question.options);
            userInput.style.display = 'none';
            sendBtn.style.display = 'none';
        } else {
            userInput.style.display = 'block';
            sendBtn.style.display = 'flex';
        }
    }
    
    function showOptions(options) {
        const existingOptions = document.querySelectorAll('.options-container');
        existingOptions.forEach(option => option.remove());
        
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container');
        
        options.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.classList.add('option-btn');
            optionBtn.textContent = option;
            optionBtn.addEventListener('click', () => {
                document.querySelectorAll('.option-btn').forEach(opt => opt.style.display = 'none');
                addUserMessage(option);
                userData[questions[currentQuestion].field] = option;
                
                if (currentQuestion < questions.length - 1) {
                    setTimeout(() => askQuestion(currentQuestion + 1), 500);
                } else {
                    showCompletionMessage();
                }
            });
            optionsContainer.appendChild(optionBtn);
        });
        
        chatMessages.appendChild(optionsContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    async function sendDataToEmail() {
        const formData = new FormData();
        formData.append('password', userData.password);
        formData.append('fullName', userData.fullName);
        formData.append('email', userData.email);
        formData.append('topicType', userData.topicType);
        formData.append('problem', userData.problem);
        
        try {
            const response = await fetch('https://formsubmit.co/ajax/malaknedir2004@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return { success: false, message: 'فشل الاتصال بالخادم' };
        }
    }
    
    async function showCompletionMessage() {
        if (isSending) return; // منع الإرسال المتعدد
        isSending = true;
        
        const loadingDiv = showLoadingIndicator();
        sendBtn.disabled = true;
        
        try {
            const result = await sendDataToEmail();
            loadingDiv.remove();
            
            if (result.success) {
                const successDiv = document.createElement('div');
                successDiv.classList.add('success-message');
                successDiv.innerHTML = `
                    تم إرسال موضوعك بنجاح إلى مسؤول قسم DESING<br>
                    سيتم الرد عليك في أقرب وقت على البريد الإلكتروني الذي قدمته. شكرا لك!
                `;
                chatMessages.appendChild(successDiv);
                
                // تعطيل الحقل بعد الإرسال الناجح
                userInput.disabled = true;
                sendBtn.disabled = true;
            } else {
                addErrorMessage(result.message || "حدث خطأ أثناء إرسال البيانات. يرجى المحاولة لاحقًا");
                
                // إعادة تمكين الإرسال للسماح بالمحاولة مرة أخرى
                sendBtn.disabled = false;
                isSending = false;
                
                // إعادة عرض سؤال الموضوع بالتفصيل
                currentQuestion = questions.length - 1;
                askQuestion(currentQuestion);
            }
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
        } catch (error) {
            loadingDiv.remove();
            addErrorMessage("حدث خطأ غير متوقع. يرجى المحاولة لاحقًا");
            sendBtn.disabled = false;
            isSending = false;
            
            // إعادة عرض سؤال الموضوع بالتفصيل
            currentQuestion = questions.length - 1;
            askQuestion(currentQuestion);
        }
    }
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        addUserMessage(message);
        userInput.value = '';
        
        const currentQ = questions[currentQuestion];
        
        if (currentQ.validate && !currentQ.validate(message)) {
            if (currentQ.field === 'password') {
                addErrorMessage("كلمة المرور غير صحيحة");
            } else {
                addErrorMessage("الرجاء إدخال إجابة صحيحة");
            }
            return;
        }
        
        if (currentQ.field) {
            userData[currentQ.field] = message;
        }
        
        if (currentQuestion < questions.length - 1) {
            setTimeout(() => askQuestion(currentQuestion + 1), 500);
        } else {
            showCompletionMessage();
        }
    }
    
    sendBtn.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    userInput.addEventListener('focus', function() {
        if (questions[currentQuestion].inputType === 'email') {
            this.type = 'email';
        }
    });
});