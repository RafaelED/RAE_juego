const startButton = document.getElementById('start-btn')
const nextButton = document.getElementById('next-btn')
const restartButton = document.getElementById('restart-btn')
const questionContainerElement = document.getElementById('question-container')
const questionElement = document.getElementById('question')
const answerButtonsElement = document.getElementById('answer-buttons')
const scoreContainerElement = document.getElementById('score-container')
const scoreElement = document.getElementById('score')
const lifelinesElement = document.getElementById('lifelines')
const fiftyFiftyButton = document.getElementById('fifty-fifty')
const callFriendButton = document.getElementById('call-friend')
const askAudienceButton = document.getElementById('ask-audience')
const askTeacherButton = document.getElementById('ask-teacher')
const messageContainerElement = document.getElementById('message-container')
const messageElement = document.getElementById('message')

let shuffledQuestions, currentQuestionIndex
let score = 0
let audienceChart = null

startButton.addEventListener('click', startGame)
nextButton.addEventListener('click', () => {
  currentQuestionIndex++
  setNextQuestion()
})
restartButton.addEventListener('click', restartGame)
fiftyFiftyButton.addEventListener('click', useFiftyFifty)
callFriendButton.addEventListener('click', callFriend)
askAudienceButton.addEventListener('click', askAudience)
askTeacherButton.addEventListener('click', askTeacher)

function startGame() {
  startButton.classList.add('hide')
  scoreContainerElement.classList.add('hide')
  lifelinesElement.classList.remove('hide')
  messageContainerElement.classList.remove('hide')
  shuffledQuestions = questions.sort(() => Math.random() - .5)
  currentQuestionIndex = 0
  score = 0
  enableLifelines()
  questionContainerElement.classList.remove('hide')
  setNextQuestion()
}

function setNextQuestion() {
  resetState()
  showQuestion(shuffledQuestions[currentQuestionIndex])
}

function showQuestion(question) {
  questionElement.innerText = question.question
  question.answers.forEach(answer => {
    const button = document.createElement('button')
    button.innerText = answer.text
    button.classList.add('btn')
    if (answer.correct) {
      button.dataset.correct = answer.correct
    }
    button.addEventListener('click', selectAnswer)
    answerButtonsElement.appendChild(button)
  })
}

function resetState() {
  nextButton.classList.add('hide')
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild)
  }
  clearStatusClass(document.body)
  messageElement.innerText = ''

  if (audienceChart) {
    audienceChart.destroy()
    audienceChart = null
  }
}

function selectAnswer(e) {
  const selectedButton = e.target
  const correct = selectedButton.dataset.correct === 'true'
  if (correct) {
    score += 10
    selectedButton.classList.add('correct')
    setTimeout(() => {
      if (shuffledQuestions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hide')
      } else {
        showScore()
      }
    }, 1000)
  } else {
    selectedButton.classList.add('wrong')
    Array.from(answerButtonsElement.children).forEach(button => {
      if (button.dataset.correct === 'true') {
        button.classList.add('correct')
      }
    })
    setTimeout(showScore, 1000)
  }
  setStatusClass(document.body, correct)
  Array.from(answerButtonsElement.children).forEach(button => {
    button.disabled = true
  })
}

function showScore() {
  questionContainerElement.classList.add('hide')
  lifelinesElement.classList.add('hide')
  messageContainerElement.classList.add('hide')
  scoreContainerElement.classList.remove('hide')
  scoreElement.innerText = `Puntuación: ${score}`
}

function setStatusClass(element, correct) {
  clearStatusClass(element)
  if (correct) {
    element.classList.add('correct')
  } else {
    element.classList.add('wrong')
  }
}

function clearStatusClass(element) {
  element.classList.remove('correct')
  element.classList.remove('wrong')
}

function restartGame() {
  scoreContainerElement.classList.add('hide')
  startButton.classList.remove('hide')
}

function enableLifelines() {
  fiftyFiftyButton.disabled = false
  callFriendButton.disabled = false
  askAudienceButton.disabled = false
  askTeacherButton.disabled = false
}

function useFiftyFifty() {
  const buttons = Array.from(answerButtonsElement.children)
  const incorrectButtons = buttons.filter(button => !button.dataset.correct)
  const correctButton = buttons.find(button => button.dataset.correct)
  
  while (incorrectButtons.length > 1) {
    const randomIndex = Math.floor(Math.random() * incorrectButtons.length)
    incorrectButtons[randomIndex].classList.add('hide')
    incorrectButtons.splice(randomIndex, 1)
  }
  
  fiftyFiftyButton.disabled = true
  messageElement.innerText = 'Se han eliminado dos respuestas incorrectas.'
}

function callFriend() {
  const correctButton = Array.from(answerButtonsElement.children).find(button => button.dataset.correct)
  const correctAnswer = correctButton.innerText
  const random = Math.random()
  let message
  
  if (random < 0.65) {
    message = `Tu amigo cree que la respuesta correcta es: ${correctAnswer}`
  } else {
    const incorrectButtons = Array.from(answerButtonsElement.children).filter(button => !button.dataset.correct)
    const randomIncorrect = incorrectButtons[Math.floor(Math.random() * incorrectButtons.length)]
    message = `Tu amigo cree que la respuesta correcta es: ${randomIncorrect.innerText}`
  }
  
  callFriendButton.disabled = true
  messageElement.innerText = message
}

function askAudience() {
  const correctButton = Array.from(answerButtonsElement.children).find(button => button.dataset.correct)
  const correctAnswer = correctButton.innerText
  const random = Math.random()
  let message
  
  const answers = Array.from(answerButtonsElement.children).map(button => button.innerText)
  const votes = [0, 0, 0, 0]

  if (random < 0.85) {
    const correctIndex = answers.indexOf(correctAnswer)
    votes[correctIndex] = Math.floor(Math.random() * 40) + 30 // 30-70 votes for correct answer
  } else {
    const incorrectButtons = answers.filter(answer => answer !== correctAnswer)
    const randomIncorrect = incorrectButtons[Math.floor(Math.random() * incorrectButtons.length)]
    const incorrectIndex = answers.indexOf(randomIncorrect)
    votes[incorrectIndex] = Math.floor(Math.random() * 40) + 30 // 30-70 votes for an incorrect answer
  }

  // Distribute remaining votes
  const remainingVotes = 100 - votes.reduce((a, b) => a + b, 0)
  for (let i = 0; i < votes.length; i++) {
    if (votes[i] === 0) {
      votes[i] = Math.floor(Math.random() * remainingVotes)
    }
  }

  message = `El público cree que la respuesta correcta es: ${answers[votes.indexOf(Math.max(...votes))]}`
  messageElement.innerText = message

  // Destroy the existing chart if it exists
  if (audienceChart) {
    audienceChart.destroy()
  }

  // Generate the chart
  const ctx = document.getElementById('audienceChart').getContext('2d')
  audienceChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: answers,
        datasets: [{
            label: 'Votos del público',
            data: votes,
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
  })

  askAudienceButton.disabled = true
}

function askTeacher() {
  const correctButton = Array.from(answerButtonsElement.children).find(button => button.dataset.correct)
  const correctAnswer = correctButton.innerText
  const message = `El profesor dice que la respuesta correcta es: ${correctAnswer}`
  
  askTeacherButton.disabled = true
  messageElement.innerText = message
}

const questions = [
  {
    question: '¿Qué material no es reciclable?',
    answers: [
      { text: 'Vidrio', correct: false },
      { text: 'Plástico', correct: false },
      { text: 'Papel', correct: false },
      { text: 'Residuos orgánicos', correct: true }
    ]
  },
  {
    question: '¿Cuál es el principal gas de efecto invernadero emitido por actividades humanas?',
    answers: [
      { text: 'Metano', correct: false },
      { text: 'Dióxido de carbono', correct: true },
      { text: 'Óxido nitroso', correct: false },
      { text: 'Ozono', correct: false }
    ]
  },
  {
    question: '¿Cuál de los siguientes es un ejemplo de energía renovable?',
    answers: [
      { text: 'Petróleo', correct: false },
      { text: 'Carbón', correct: false },
      { text: 'Energía solar', correct: true },
      { text: 'Gas natural', correct: false }
    ]
  },
  {
    question: '¿Qué significa la regla de las 3 R en el reciclaje?',
    answers: [
      { text: 'Reducir, Reutilizar, Reciclar', correct: true },
      { text: 'Recoger, Respetar, Restaurar', correct: false },
      { text: 'Reciclar, Reducir, Reproducir', correct: false },
      { text: 'Reutilizar, Reciclar, Restaurar', correct: false }
    ]
  },
  {
    question: '¿Cuál es el impacto principal de los plásticos en los océanos?',
    answers: [
      { text: 'Aumenta la temperatura del agua', correct: false },
      { text: 'Contamina el agua y daña la vida marina', correct: true },
      { text: 'Reduce la salinidad del agua', correct: false },
      { text: 'Aumenta la población de peces', correct: false }
    ]
  },
  {
    question: '¿Qué tipo de residuo es el papel?',
    answers: [
      { text: 'Orgánico', correct: false },
      { text: 'Inorgánico', correct: false },
      { text: 'Reciclable', correct: true },
      { text: 'Tóxico', correct: false }
    ]
  },
  {
    question: '¿Qué es el cambio climático?',
    answers: [
      { text: 'La variación natural del clima', correct: false },
      { text: 'El calentamiento global causado por actividades humanas', correct: true },
      { text: 'Un fenómeno natural sin intervención humana', correct: false },
      { text: 'La disminución de la capa de ozono', correct: false }
    ]
  },
  {
    question: '¿Cuál es la fuente principal de contaminación del aire en las ciudades?',
    answers: [
      { text: 'Plantas', correct: false },
      { text: 'Vehículos', correct: true },
      { text: 'Animales', correct: false },
      { text: 'Oceános', correct: false }
    ]
  },
  {
    question: '¿Qué se debe hacer con las pilas y baterías usadas?',
    answers: [
      { text: 'Tirarlas al basurero', correct: false },
      { text: 'Reciclarlas en puntos específicos', correct: true },
      { text: 'Tirarlas en el jardín', correct: false },
      { text: 'Guardarlas en casa', correct: false }
    ]
  },
  {
    question: '¿Qué es el compostaje?',
    answers: [
      { text: 'La quema de residuos', correct: false },
      { text: 'La separación de residuos', correct: false },
      { text: 'La transformación de residuos orgánicos en abono', correct: true },
      { text: 'La creación de materiales plásticos', correct: false }
    ]
  },
  {
    question: '¿Qué material es biodegradable?',
    answers: [
      { text: 'Plástico', correct: false },
      { text: 'Vidrio', correct: false },
      { text: 'Papel', correct: true },
      { text: 'Metal', correct: false }
    ]
  },
  {
    question: '¿Qué recurso natural es renovable?',
    answers: [
      { text: 'Petróleo', correct: false },
      { text: 'Carbón', correct: false },
      { text: 'Energía eólica', correct: true },
      { text: 'Gas natural', correct: false }
    ]
  },
  {
    question: '¿Cuál es la consecuencia del deshielo de los glaciares?',
    answers: [
      { text: 'Disminución del nivel del mar', correct: false },
      { text: 'Aumento del nivel del mar', correct: true },
      { text: 'Mejora del hábitat marino', correct: false },
      { text: 'Reducción de la temperatura global', correct: false }
    ]
  },
  {
    question: '¿Qué es la huella de carbono?',
    answers: [
      { text: 'La cantidad de residuos sólidos que una persona produce', correct: false },
      { text: 'La cantidad de gases de efecto invernadero emitidos por una persona o empresa', correct: true },
      { text: 'La cantidad de agua utilizada por una persona', correct: false },
      { text: 'La cantidad de energía renovable que una persona consume', correct: false }
    ]
  },
  {
    question: '¿Qué es un residuo tóxico?',
    answers: [
      { text: 'Residuos que no se descomponen fácilmente', correct: false },
      { text: 'Residuos peligrosos para la salud y el medio ambiente', correct: true },
      { text: 'Residuos que se pueden reciclar fácilmente', correct: false },
      { text: 'Residuos orgánicos', correct: false }
    ]
  },
  {
    question: '¿Cuál es el objetivo del reciclaje?',
    answers: [
      { text: 'Incrementar la producción de materiales nuevos', correct: false },
      { text: 'Reducir la cantidad de residuos y reutilizar materiales', correct: true },
      { text: 'Eliminar todos los residuos', correct: false },
      { text: 'Aumentar el consumo de energía', correct: false }
    ]
  },
  {
    question: '¿Qué es el efecto invernadero?',
    answers: [
      { text: 'Un fenómeno donde la atmósfera atrapa el calor del sol', correct: true },
      { text: 'La destrucción de la capa de ozono', correct: false },
      { text: 'El enfriamiento global', correct: false },
      { text: 'El aumento de la actividad sísmica', correct: false }
    ]
  },
  {
    question: '¿Cuál de los siguientes es un ejemplo de contaminación del agua?',
    answers: [
      { text: 'Uso de fertilizantes orgánicos', correct: false },
      { text: 'Vertido de productos químicos en ríos', correct: true },
      { text: 'Aumento de la población de peces', correct: false },
      { text: 'Lluvias abundantes', correct: false }
    ]
  },
  {
    question: '¿Cuál es la forma más efectiva de reducir la basura?',
    answers: [
      { text: 'Tirar todo en el basurero', correct: false },
      { text: 'Separar y reciclar los residuos', correct: true },
      { text: 'Quemar los residuos', correct: false },
      { text: 'Enterrar los residuos', correct: false }
    ]
  },
  {
    question: '¿Qué se debe hacer con los residuos electrónicos?',
    answers: [
      { text: 'Tirarlos a la basura común', correct: false },
      { text: 'Llevarlos a centros de reciclaje especializados', correct: true },
      { text: 'Guardarlos en casa', correct: false },
      { text: 'Venderlos en el mercado', correct: false }
    ]
  }
]

