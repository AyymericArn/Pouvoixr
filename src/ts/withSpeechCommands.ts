import Engine from './app'

export default function withSpeechCommands (engine: Engine) {
    // @ts-ignore
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    // @ts-ignore
    const recognition = new SpeechRecognition()
    recognition.interimResults = false

    // recognition.onresult = () => {
    //     console.log('resultat')
    // }

    recognition.addEventListener('result', e => {
        
        const transcript = Array.from(e.results)
            .map(res => res[0])
            .map(res => res.transcript)
            .join('');

        // const backOf = /^reculer.de.[0-9]+.secondes$/.test(transcript)

        switch (transcript) {
            case 'commencer':
                engine.displayScene()
                break;
            
            case 'commande':
                engine.displayHelp()
                break;
            
            case 'commandes':
                engine.displayHelp()
                break;

            case 'lecture':
                // ! duplicated code !
                engine.audioPlayer.audioContext.state === 'suspended' ? engine.audioPlayer.audioContext.resume() : null;
                engine.audioPlayer.$audios[engine.state.step].play()
                engine.audioPlayer.$playerControls.play.children[0].classList.add('switch-play-state')
                setTimeout(() => {
                    (engine.audioPlayer.$playerControls.play.children[0] as HTMLImageElement).src = pauseSrc
                }, 100);
                setTimeout(() => {
                    engine.audioPlayer.$playerControls.play.children[0].classList.remove('switch-play-state')
                }, 200);

                break;
                
            case 'pause':
                // ! duplicated code !
                engine.audioPlayer.$audios[engine.state.step].pause()
                engine.audioPlayer.emitter.dispatchEvent(new Event('pause'))
                setTimeout(() => {
                    (this.$playerControls.play.children[0] as HTMLImageElement).src = playSrc
                }, 100);
                setTimeout(() => {
                    engine.audioPlayer.$playerControls.play.children[0].classList.remove('switch-play-state')
                }, 200);
                break;
                
            case 'reculer':
                engine.audioPlayer.$audios[engine.state.step].currentTime -= 10
                engine.audioPlayer.$playerControls.backward.children[0].classList.add('research')
                setTimeout(() => {
                    engine.audioPlayer.$playerControls.backward.children[0].classList.remove('research')
                }, 200);
                break;
                
            case 'avancer':
                engine.audioPlayer.$audios[engine.state.step].currentTime += 10
                engine.audioPlayer.$playerControls.forward.children[0].classList.add('research')
                setTimeout(() => {
                    engine.audioPlayer.$playerControls.forward.children[0].classList.remove('research')
                }, 200);
                break;

            // // @ts-ignore
            // case /^reculer.de.[0-9]+.secondes$/.test(transcript):
            //     engine.audioPlayer.$audio.currentTime -= parseInt(transcript)
            //     break;
                
            // // @ts-ignore
            // case true:
            //     engine.audioPlayer.$audio.currentTime += parseInt(transcript)
            //     console.log(parseInt(transcript));
                
            //     break;
                
            case 'épisode suivant':
                engine.nextStep()
                break;

            case 'épisode précédent':
                engine.prevStep()
                break;
                
            default:
                console.log(transcript)
                break;
        }
    })

    recognition.addEventListener('end', recognition.start)

    recognition.start()

    return engine
}