import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AvatarService {
    /**
     * Read file as data URL for preview
     */
    readFileAsDataUrl(file: File): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            const reader = new FileReader();
            reader.onload = () => {
                observer.next(reader.result as string);
                observer.complete();
            };
            reader.onerror = (error) => {
                observer.error(error);
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Validate image file
     */
    validateImage(file: File, maxSizeMB: number): { valid: boolean; error?: string } {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Only PNG and JPEG images are allowed',
            };
        }

        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return {
                valid: false,
                error: `File size must not exceed ${maxSizeMB}MB`,
            };
        }

        return { valid: true };
    }
}
