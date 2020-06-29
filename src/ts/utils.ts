import charming from 'charming'

export function roundText($el: HTMLElement, selector: string) {
    // $el.classList.add('round')
    charming($el)
    addStyle(`
        ${selector} span {
            position: absolute;
            width: 20px;
            left: 0;
            top: 0;
            transform-origin: bottom center;
            height: 200px;
        }

        ${[...$el.children].map((span, index) => (
            `
                ${selector} .char${index} { 
                    transform: rotate(${ index * (360 / $el.children.length) }deg); 
                }
            
            `
        ))}
    `)
}

function addStyle(content:string) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = content;
    document.getElementsByTagName('head')[0].appendChild(style);
}
