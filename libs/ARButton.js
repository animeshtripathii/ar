import * as THREE from './three.min.js';

class ARButton {
    static createButton(renderer, options = {}) {
        if (options.requiredFeatures) {
            for (const feature of options.requiredFeatures) {
                if (!navigator.xr.isSessionSupported(feature)) {
                    const message = document.createElement('div');
                    message.innerHTML = `AR not supported: ${feature}`;
                    message.style.display = 'none';
                    document.body.appendChild(message);
                    return message;
                }
            }
        }

        const button = document.createElement('button');
        button.innerHTML = 'ENTER AR';
        button.style.display = 'none';

        button.addEventListener('click', function() {
            const sessionInit = {
                requiredFeatures: options.requiredFeatures || ['local-floor'],
                optionalFeatures: options.optionalFeatures || ['dom-overlay'],
                domOverlay: { root: document.body }
            };

            navigator.xr.requestSession('immersive-ar', sessionInit)
                .then((session) => {
                    session.addEventListener('end', () => {
                        renderer.xr.setSession(null);
                        button.style.display = '';
                    });

                    renderer.xr.setSession(session);
                    button.style.display = 'none';
                });
        });

        return button;
    }
}

export { ARButton };
