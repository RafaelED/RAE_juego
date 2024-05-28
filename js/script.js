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
    document.getElementById('npregunta').innerHTML = currentQuestionIndex+2
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
    "question": "¿Qué es la economía circular?",
    "answers": [
      { "text": "Un modelo económico basado en la producción lineal y el desecho", "correct": false },
      { "text": "Un sistema económico que busca minimizar el desperdicio y maximizar la reutilización de recursos", "correct": true },
      { "text": "Una estrategia para aumentar el consumo de productos electrónicos", "correct": false },
      { "text": "Un enfoque para diseñar productos con ciclos de vida más cortos", "correct": false }
    ]
  },
  {
    "question": "¿Cuál es uno de los objetivos principales de la economía circular en el contexto de los RAEE?",
    "answers": [
      { "text": "Incrementar la producción de aparatos electrónicos", "correct": false },
      { "text": "Reducir la cantidad de residuos electrónicos y recuperar materiales valiosos", "correct": true },
      { "text": "Desarrollar nuevos tipos de dispositivos desechables", "correct": false },
      { "text": "Fomentar el uso de energía no renovable", "correct": false }
    ]
  },
  {
    "question": "¿Qué se entiende por 'ciclo de vida de los RAEE'?",
    "answers": [
      { "text": "El tiempo que un dispositivo está en el mercado", "correct": false },
      { "text": "Las etapas que atraviesa un aparato electrónico desde su producción hasta su eliminación", "correct": true },
      { "text": "El periodo durante el cual un dispositivo funciona sin fallos", "correct": false },
      { "text": "El proceso de diseño de nuevos dispositivos electrónicos", "correct": false }
    ]
  },
  {
    "question": "¿Qué sustancias peligrosas se encuentran comúnmente en los RAEE?",
    "answers": [
      { "text": "Arsénico, Cadmio, Cromo hexavalente, Mercurio, Plomo", "correct": true },
      { "text": "Oxígeno, Nitrógeno, Helio, Argón, Neón", "correct": false },
      { "text": "Hierro, Cobre, Aluminio, Plata, Oro", "correct": false },
      { "text": "Ácido sulfúrico, Ácido clorhídrico, Amoníaco, Metano, Propano", "correct": false }
    ]
  },
  {
    "question": "¿Cuál es uno de los impactos ambientales negativos asociados con el manejo inadecuado de los RAEE?",
    "answers": [
      { "text": "Aumento de la biodiversidad", "correct": false },
      { "text": "Liberación de sustancias tóxicas como dioxinas y furanos", "correct": true },
      { "text": "Reducción de los niveles de CO2 en la atmósfera", "correct": false },
      { "text": "Mejora de la calidad del aire en las ciudades", "correct": false }
    ]
  },
  {
    "question": "¿Qué prácticas se fomentan en el diseño de productos dentro de una economía circular?",
    "answers": [
      { "text": "Diseño para la durabilidad, facilidad de reparación y actualizaciones", "correct": true },
      { "text": "Diseño para un solo uso y desecho rápido", "correct": false },
      { "text": "Producción de dispositivos con ciclos de vida muy cortos", "correct": false },
      { "text": "Diseño que maximiza el uso de materiales no reciclables", "correct": false }
    ]
  },
  {
    "question": "¿Qué es la evaluación del ciclo de vida (LCA) en el contexto de los RAEE?",
    "answers": [
      { "text": "Una técnica para analizar el costo financiero de producir dispositivos electrónicos", "correct": false },
      { "text": "Un método para evaluar los impactos ambientales de un producto a lo largo de su vida", "correct": true },
      { "text": "Un sistema para medir la satisfacción del cliente con los dispositivos electrónicos", "correct": false },
      { "text": "Un proceso para determinar la obsolescencia planificada de los productos", "correct": false }
    ]
  },
  {
    "question": "¿Por qué es importante la gestión adecuada del fin de vida de los RAEE?",
    "answers": [
      { "text": "Para aumentar las ventas de nuevos productos electrónicos", "correct": false },
      { "text": "Para minimizar el impacto ambiental y recuperar materiales valiosos", "correct": true },
      { "text": "Para fomentar el uso de dispositivos de un solo uso", "correct": false },
      { "text": "Para reducir la vida útil de los productos", "correct": false }
    ]
  },
  {
    "question": "¿Cuál es una de las sustancias más tóxicas liberadas al ambiente por la quema de RAEE?",
    "answers": [
      { "text": "Oxígeno", "correct": false },
      { "text": "Dioxinas y furanos", "correct": true },
      { "text": "Dióxido de carbono", "correct": false },
      { "text": "Monóxido de carbono", "correct": false }
    ]
  },
  {
    "question": "¿Qué metal recuperable se menciona en los RAEE por su valor económico?",
    "answers": [
      { "text": "Hierro", "correct": false },
      { "text": "Oro", "correct": true },
      { "text": "Aluminio", "correct": false },
      { "text": "Níquel", "correct": false }
    ]
  },
  {
    "question": "¿Qué componente es importante evitar liberar durante el desensamble de RAEE?",
    "answers": [
      { "text": "Nitrógeno", "correct": false },
      { "text": "Mercurio", "correct": true },
      { "text": "Oxígeno", "correct": false },
      { "text": "Hidrógeno", "correct": false }
    ]
  },
  {
    "question": "¿Qué práctica no es parte de la economía circular?",
    "answers": [
      { "text": "Reutilización de productos", "correct": false },
      { "text": "Desperdicio sistemático de materiales", "correct": true },
      { "text": "Reciclaje de materiales", "correct": false },
      { "text": "Reducción de residuos", "correct": false }
    ]
  },
  {
    "question": "¿Qué metal peligroso se encuentra en los RAEE?",
    "answers": [
      { "text": "Plata", "correct": false },
      { "text": "Cadmio", "correct": true },
      { "text": "Aluminio", "correct": false },
      { "text": "Cobre", "correct": false }
    ]
  },
  {
    "question": "¿Qué es un modelo de negocio que apoya la economía circular?",
    "answers": [
      { "text": "Venta de productos desechables", "correct": false },
      { "text": "Arrendamiento y esquemas de devolución", "correct": true },
      { "text": "Promoción del consumo masivo", "correct": false },
      { "text": "Producción en masa sin reciclaje", "correct": false }
    ]
  },
  {
    "question": "¿Cuál es el principal objetivo del diseño sostenible?",
    "answers": [
      { "text": "Incrementar la obsolescencia planificada", "correct": false },
      { "text": "Reducir el impacto ambiental a lo largo del ciclo de vida del producto", "correct": true },
      { "text": "Maximizar el uso de materiales vírgenes", "correct": false },
      { "text": "Fomentar el uso de energía no renovable", "correct": false }
    ]
  },
  {
    "question": "¿Qué es un componente tóxico común en los RAEE?",
    "answers": [
      { "text": "Ácido acético", "correct": false },
      { "text": "Plomo", "correct": true },
      { "text": "Sulfato de cobre", "correct": false },
      { "text": "Fosfato de calcio", "correct": false }
    ]
  },
  {
    "question": "¿Por qué es importante la recuperación de materiales de los RAEE?",
    "answers": [
      { "text": "Para reducir el precio de los productos nuevos", "correct": false },
      { "text": "Para conservar recursos naturales y reducir la contaminación", "correct": true },
      { "text": "Para incrementar el consumo de energía", "correct": false },
      { "text": "Para aumentar la producción de residuos", "correct": false }
    ]
  },
  {
    "question": "¿Qué metal valioso se puede recuperar de los RAEE?",
    "answers": [
      { "text": "Níquel", "correct": false },
      { "text": "Plata", "correct": true },
      { "text": "Plomo", "correct": false },
      { "text": "Arsénico", "correct": false }
    ]
  },
  {
    "question": "¿Qué es una práctica sostenible en la gestión de RAEE?",
    "answers": [
      { "text": "Eliminar los residuos en vertederos comunes", "correct": false },
      { "text": "Reciclar y recuperar materiales valiosos", "correct": true },
      { "text": "Quemar los residuos sin tratamiento", "correct": false },
      { "text": "Desechar los residuos en ríos y océanos", "correct": false }
    ]
  },
  {
    "question": "¿Cuál es uno de los beneficios de la economía circular?",
    "answers": [
      { "text": "Mayor dependencia de recursos no renovables", "correct": false },
      { "text": "Reducción del desperdicio y mejora de la eficiencia de los recursos", "correct": true },
      { "text": "Incremento en la producción de desechos", "correct": false },
      { "text": "Aumento del consumo de productos desechables", "correct": false }
    ]
  },
  {
    "question": "¿Qué práctica NO contribuye a una economía circular?",
    "answers": [
      { "text": "Reciclaje de materiales", "correct": false },
      { "text": "Uso de productos desechables", "correct": true },
      { "text": "Reutilización de productos", "correct": false },
      { "text": "Reducción de la generación de residuos", "correct": false }
    ]
  },
  {
    "question": "¿Qué metal pesado presente en los RAEE es altamente tóxico?",
    "answers": [
      { "text": "Oro", "correct": false },
      { "text": "Mercurio", "correct": true },
      { "text": "Cobre", "correct": false },
      { "text": "Hierro", "correct": false }
    ]
  },
  {
    "question": "¿Qué es el 'desensamble' de los RAEE?",
    "answers": [
      { "text": "El proceso de ensamblar un dispositivo electrónico nuevo", "correct": false },
      { "text": "El proceso de desmontar dispositivos electrónicos al final de su vida útil", "correct": true },
      { "text": "El diseño de dispositivos electrónicos", "correct": false },
      { "text": "El proceso de venta de dispositivos electrónicos", "correct": false }
    ]
  },
  {
    "question": "¿Qué impacto negativo tiene el manejo inadecuado de los RAEE en el medio ambiente?",
    "answers": [
      { "text": "Mejora de la calidad del aire", "correct": false },
      { "text": "Contaminación del suelo y el agua con metales pesados", "correct": true },
      { "text": "Aumento de la biodiversidad", "correct": false },
      { "text": "Reducción de la contaminación acústica", "correct": false }
    ]
  },
  {
    "question": "¿Cuál es un objetivo clave del diseño de productos en una economía circular?",
    "answers": [
      { "text": "Maximizar la obsolescencia de los productos", "correct": false },
      { "text": "Facilitar la reparación, actualización y reciclaje", "correct": true },
      { "text": "Aumentar el uso de materiales no reciclables", "correct": false },
      { "text": "Diseñar productos con vida útil corta", "correct": false }
    ]
  },
  {
    "question": "¿Qué elemento se utiliza comúnmente en la producción de RAEE y es peligroso para el medio ambiente?",
    "answers": [
      { "text": "Plomo", "correct": true },
      { "text": "Silicio", "correct": false },
      { "text": "Cobalto", "correct": false },
      { "text": "Níquel", "correct": false }
    ]
  },
  {
    "question": "¿Por qué es importante la evaluación del ciclo de vida (LCA) para los RAEE?",
    "answers": [
      { "text": "Para aumentar el costo de producción", "correct": false },
      { "text": "Para identificar y minimizar los impactos ambientales en todas las etapas del ciclo de vida", "correct": true },
      { "text": "Para reducir la durabilidad de los productos", "correct": false },
      { "text": "Para fomentar el uso de materiales tóxicos", "correct": false }
    ]
  },
  {
    "question": "¿Qué sustancias tóxicas se liberan cuando los RAEE se queman inadecuadamente?",
    "answers": [
      { "text": "Ácido sulfúrico y amoníaco", "correct": false },
      { "text": "Dioxinas y furanos", "correct": true },
      { "text": "Cloruro de sodio y dióxido de carbono", "correct": false },
      { "text": "Monóxido de carbono y oxígeno", "correct": false }
    ]
  },
  {
    "question": "¿Qué es una estrategia sostenible en el manejo de los RAEE?",
    "answers": [
      { "text": "Incineración sin tratamiento", "correct": false },
      { "text": "Reutilización y reciclaje de componentes", "correct": true },
      { "text": "Desecho en vertederos comunes", "correct": false },
      { "text": "Exportación a países en desarrollo sin control", "correct": false }
    ]
  },
  {
    "question": "¿Qué metal recuperable en los RAEE tiene alto valor económico?",
    "answers": [
      { "text": "Plomo", "correct": false },
      { "text": "Oro", "correct": true },
      { "text": "Zinc", "correct": false },
      { "text": "Hierro", "correct": false }
    ]
  },
  {
    "question": "¿Cuál es un beneficio de la economía circular en la gestión de RAEE?",
    "answers": [
      { "text": "Incremento en la producción de residuos", "correct": false },
      { "text": "Reducción del desperdicio y mejora de la eficiencia de recursos", "correct": true },
      { "text": "Mayor dependencia de materiales no renovables", "correct": false },
      { "text": "Mayor consumo de productos desechables", "correct": false }
    ]
  },
  {
    "question": "¿Qué se busca evitar mediante una correcta gestión de los RAEE?",
    "answers": [
      { "text": "Recuperación de materiales", "correct": false },
      { "text": "Liberación de sustancias tóxicas al ambiente", "correct": true },
      { "text": "Reutilización de componentes", "correct": false },
      { "text": "Reducción de la contaminación", "correct": false }
    ]
  },
  {
    "question": "¿Cuál es uno de los objetivos de la economía circular?",
    "answers": [
      { "text": "Aumentar el consumo de productos desechables", "correct": false },
      { "text": "Maximizar la reutilización y reciclaje de recursos", "correct": true },
      { "text": "Promover la obsolescencia programada", "correct": false },
      { "text": "Incrementar el desperdicio de materiales", "correct": false }
    ]
  },
  {
    "question": "¿Qué es la gestión de fin de vida de los RAEE?",
    "answers": [
      { "text": "El proceso de diseñar nuevos dispositivos", "correct": false },
      { "text": "El tratamiento y disposición adecuada de los dispositivos al final de su vida útil", "correct": true },
      { "text": "La comercialización de dispositivos electrónicos", "correct": false },
      { "text": "El ensamblaje de dispositivos electrónicos nuevos", "correct": false }
    ]
  },
  {
    "question": "¿Cuál es una práctica que no forma parte de la economía circular?",
    "answers": [
      { "text": "Reutilización de productos", "correct": false },
      { "text": "Reciclaje de materiales", "correct": false },
      { "text": "Desecho indiscriminado de productos", "correct": true },
      { "text": "Reducción de la generación de residuos", "correct": false }
    ]
  },
  {
    "question": "¿Qué es la economía circular?",
    "answers": [
      { "text": "Un modelo económico basado en la producción lineal y el desecho", "correct": false },
      { "text": "Un sistema económico que busca minimizar el desperdicio y maximizar la reutilización de recursos", "correct": true },
      { "text": "Una estrategia para aumentar el consumo de productos electrónicos", "correct": false },
      { "text": "Un enfoque para diseñar productos con ciclos de vida más cortos", "correct": false }
    ]
  },
  {
    "question": "¿Qué sustancias peligrosas se encuentran comúnmente en los RAEE?",
    "answers": [
      { "text": "Arsénico, Cadmio, Cromo hexavalente, Mercurio, Plomo", "correct": true },
      { "text": "Oxígeno, Nitrógeno, Helio, Argón, Neón", "correct": false },
      { "text": "Hierro, Cobre, Aluminio, Plata, Oro", "correct": false },
      { "text": "Ácido sulfúrico, Ácido clorhídrico, Amoníaco, Metano, Propano", "correct": false }
    ]
  },
  {
    "question": "¿Cuál es uno de los impactos ambientales negativos asociados con el manejo inadecuado de los RAEE?",
    "answers": [
      { "text": "Aumento de la biodiversidad", "correct": false },
      { "text": "Liberación de sustancias tóxicas como dioxinas y furanos", "correct": true },
      { "text": "Reducción de los niveles de CO2 en la atmósfera", "correct": false },
      { "text": "Mejora de la calidad del aire en las ciudades", "correct": false }
    ]
  },
  {
    "question": "¿Qué prácticas se fomentan en el diseño de productos dentro de una economía circular?",
    "answers": [
      { "text": "Diseño para la durabilidad, facilidad de reparación y actualizaciones", "correct": true },
      { "text": "Diseño para un solo uso y desecho rápido", "correct": false },
      { "text": "Producción de dispositivos con ciclos de vida muy cortos", "correct": false },
      { "text": "Diseño que maximiza el uso de materiales no reciclables", "correct": false }
    ]
  },
  {
    "question": "¿Qué es la evaluación del ciclo de vida (LCA) en el contexto de los RAEE?",
    "answers": [
      { "text": "Una técnica para analizar el costo financiero de producir dispositivos electrónicos", "correct": false },
      { "text": "Un método para evaluar los impactos ambientales de un producto a lo largo de su vida", "correct": true },
      { "text": "Un sistema para medir la satisfacción del cliente con los dispositivos electrónicos", "correct": false },
      { "text": "Un proceso para determinar la obsolescencia planificada de los productos", "correct": false }
    ]
  }
]


