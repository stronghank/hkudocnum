export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://qa-miniapp.med.hku.hk';
    return `${baseUrl}/docnum${src}?w=${width}&q=${quality || 75}`;
}