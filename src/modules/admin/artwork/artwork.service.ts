
import { Injectable } from '@nestjs/common';
import { Artwork } from './artwork.entity';
import { CreateArtworkInput } from './dto/create-artwork.input';

@Injectable()
export class ArtworkService {

    private artworks: Artwork[] = [
        { id: 1, title: 'Abstract Art', artistName: 'Rahul', price: 500 },
        { id: 1, title: 'Abstract Art', artistName: 'Rahul', price: 500 },
        { id: 1, title: 'Abstract Art', artistName: 'Rahul', price: 500 },
        { id: 1, title: 'Abstract Art', artistName: 'Rahul', price: 500 },
        { id: 1, title: 'Abstract Art', artistName: 'Rahul', price: 500 },
    ];

    findAll(): Artwork[] {
        return this.artworks;
    }

    create(input: CreateArtworkInput): Artwork {

        const newArtwork: Artwork = {
            id: this.artworks.length + 1,
            ...input,
        };

        this.artworks.push(newArtwork);

        return newArtwork;
    }
}