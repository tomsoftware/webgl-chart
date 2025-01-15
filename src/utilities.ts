export class Utilities {
    /** start downloading an image in the browser */
    public static DownloadImage(img: HTMLImageElement, fileName = 'image') {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}