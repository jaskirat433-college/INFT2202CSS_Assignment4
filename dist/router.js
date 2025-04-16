export class Router {
    constructor(rootElement) {
        this.routes = [];
        this.rootElement = rootElement;
        this.handleLocation = this.handleLocation.bind(this);
        window.addEventListener('popstate', this.handleLocation);
    }
    route(path, viewFile) {
        this.routes.push({ path, viewFile });
    }
    fixStaticPaths(html) {
        // Fix paths for CSS files
        html = html.replace(/href="css\//g, 'href="/css/');
        html = html.replace(/href="node_modules\//g, 'href="/node_modules/');
        // Fix paths for JavaScript files
        html = html.replace(/src="js\//g, 'src="/js/');
        html = html.replace(/src="\.\/js\//g, 'src="/js/');
        html = html.replace(/src="node_modules\//g, 'src="/node_modules/');
        // Fix paths for images
        html = html.replace(/src="assets\//g, 'src="/assets/');
        // Fix navigation links
        html = html.replace(/href="([^"]+\.html)"/g, 'href="/$1"');
        // Fix navigation links - remove .html extension
        html = html.replace(/href="([^"]+)\.html"/g, 'href="/$1"');
        return html;
    }
    async loadHtmlFile(filePath) {
        try {
            console.log('Loading file:', filePath); // Add debugging
            const response = await fetch(filePath);
            if (!response.ok) {
                console.error(`Failed to load ${filePath}: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            // Fix static file paths
            const fixedHtml = this.fixStaticPaths(html);
            // Create a temporary container to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(fixedHtml, 'text/html');
            // Find the main content
            const mainContent = doc.querySelector('main');
            if (mainContent) {
                // Clone the main content
                const clonedContent = mainContent.cloneNode(true);
                clonedContent.querySelectorAll('script').forEach(script => script.remove());
                this.rootElement.innerHTML = clonedContent.innerHTML;
            }
            else {
                throw new Error('No main content found in the HTML file');
            }
        }
        catch (error) {
            console.error('Error loading HTML file:', error);
            this.rootElement.innerHTML = `
                <div class="container text-center mt-5">
                    <h1>Error Loading Content</h1>
                    <p class="text-danger">Failed to load ${filePath}</p>
                    <p class="text-muted">Please try again later or contact support.</p>
                </div>
            `;
        }
    }
    async handleLocation() {
        const path = window.location.pathname;
        // Check authentication for protected routes
        const protectedRoutes = ['/statistics', '/event-planning'];
        if (protectedRoutes.includes(path)) {
            const user = localStorage.getItem('user');
            if (!user) {
                window.location.href = '/login';
                return;
            }
        }
        // Update active links
        document.querySelectorAll('a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === path) {
                link.classList.add('active');
            }
        });
        // Find matching route
        const route = this.routes.find(route => route.path === path);
        if (route) {
            await this.loadHtmlFile(route.viewFile);
        }
        else {
            // Load 404 page
            const notFoundRoute = this.routes.find(route => route.path === '/404');
            if (notFoundRoute) {
                await this.loadHtmlFile(notFoundRoute.viewFile);
            }
            else {
                this.rootElement.innerHTML = '<h1 class="text-center">404 - Page Not Found</h1>';
            }
        }
    }
    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleLocation();
    }
    init() {
        this.handleLocation();
    }
}
//# sourceMappingURL=router.js.map