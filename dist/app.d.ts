export interface Route {
    path: string;
    viewFile: string;
}
export declare class Router {
    private routes;
    private rootElement;
    constructor(rootElement: HTMLElement);
    route(path: string, viewFile: string): void;
    private fixStaticPaths;
    private loadHtmlFile;
    handleLocation(): Promise<void>;
    navigate(path: string): void;
    init(): void;
}
