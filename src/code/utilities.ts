export function fileToDataURL(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as any);
		reader.onerror = () => {
			reader.abort();
			reject(new Error("File reading failed"));
		};
		reader.readAsDataURL(file);
	});
}
