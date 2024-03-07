let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;

async function fetchTriviaQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=11&medium=hard&type=boolean');
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        questions = data.results;
        displayTriviaQuestion();
    } catch (error) {
        console.error('Error fetching trivia questions:', error);
    }
}

function displayTriviaQuestion() {
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const scoreElement = document.getElementById('score');
    if (questionElement && optionsElement && scoreElement && questions.length > 0 && currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        questionElement.innerHTML = decodeEntities(question.question);
        optionsElement.innerHTML = `
                    <button id="trueBtn" onclick="checkAnswer(true)">True</button>
                    <button id="falseBtn" onclick="checkAnswer(false)">False</button>
                `;
        scoreElement.textContent = `Score: ${correctAnswers}/${currentQuestionIndex}`;
    } else {
        const finalScore = `Final score: <strong>${correctAnswers}/${questions.length}</strong>`;
        questionElement.innerHTML = 'No more questions available.';
        scoreElement.innerHTML = finalScore;
        optionsElement.innerHTML = '';
        document.getElementById('restartBtn').style.display = 'block';
    }
}

function checkAnswer(userAnswer) {
    const question = questions[currentQuestionIndex];
    const correctAnswer = question.correct_answer === 'True';
    if (userAnswer === correctAnswer) {
        correctAnswers++;
        console.log('Correct');
    } else {
        console.log('Incorrect');
    }
    currentQuestionIndex++;
    displayTriviaQuestion();
}

function decodeEntities(encodedString) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = encodedString;
    return textarea.value;
}

function restartGame() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    fetchTriviaQuestions();
    document.getElementById('restartBtn').style.display = 'none';
}

fetchTriviaQuestions();
