import bot from './assets/bot.svg'
import user from './assets/user.svg'
import mic from './assets/blue_mic.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

function loader(element) {
  element.textContent = " "

loadInterval = setInterval(() => {
  element.textContent += '.'
  if(element.textContent === '...'){
    element.textContent = ' '
  }
}, 300)
}

function typeText(element, text){
  let index = 0

  let interval = setInterval(()=> {
    if(index < text.length){
      element.innerHTML += text.charAt(index)
      index++
      
    }else {
      clearInterval(interval)
    }
  },20)
  console.log(text)
  readOutLoud(text)
 
}

function generateUniqueId(){
  const timeStamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)
  
  return `id-${timeStamp}-${hexadecimalString}`

}

function chatStripe(isAi, value, uniqueId){
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
          src="${isAi ? bot : user}"
          alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>

    `
  )
}
  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    //user chatStripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt')) 

    form.reset()

    //bot chatStripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, ' ', uniqueId)

    chatContainer.scrollTop = chatContainer.scrollHeight

    const messageDiv = document.getElementById(uniqueId)

    loader(messageDiv)

    const response = await fetch('http://localhost:5000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          prompt: data.get('prompt')
        })
    })
    clearInterval(loadInterval)

    messageDiv.innerHTML = " "

    if(response.ok){
      const data = await response.json()
      const parsedData = data.bot.trim()

      typeText(messageDiv, parsedData)
      form.reset()
      
     }else {
      const err = await response.text()
      messageDiv.innerHtml = `Something went wrong`

      alert(err)
     }
     
  }

  form.addEventListener('submit', handleSubmit)
  form.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
      handleSubmit(e)
    }
  })

  //Listen to speech
  const btn = document.querySelector('.speak')
  const textarea = document.querySelector('.textarea')

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  const recognition = new SpeechRecognition()

  recognition.onstart = function(){
  console.log(`voice is activated, you can speak now!`)
}

//speech to text 
recognition.onresult = function(event){
  // console.log(event, 'event')
  const text = event.resultIndex
  const transcript = event.results[text][0].transcript
  console.log(transcript, ' transcript')
  textarea.textContent = transcript
  // console.log(chatStripe(value),'value')
  // readOutLoud(transcript)
}  

btn.addEventListener('click', ()=> {
  recognition.start()
})

//speak question
function readOutLoud(message){
    const speech = new SpeechSynthesisUtterance()
    speech.text = message
    speech.volume = 1
    speech.rate = 1 
    speech.pitch = 1

    // const response = document.getElementsByClassName('.message')

    window.speechSynthesis.speak(speech)
}

// function readAnswer(){
//   const botanswer = document.querySelector('.wrapper ai')
//   console.log(botanswer,'read answer')

  
// }

// readAnswer()

