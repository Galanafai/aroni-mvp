import { createHash } from 'crypto';

export class MerkleTree {
    leaves: string[];
    levels: string[][];

    constructor(leaves: string[]) {
        // Sort leaves to ensure determinism
        this.leaves = leaves.sort();
        this.levels = [this.leaves];
        this.build();
    }

    private build() {
        let currentLevel = this.leaves;

        while (currentLevel.length > 1) {
            const nextLevel: string[] = [];

            for (let i = 0; i < currentLevel.length; i += 2) {
                if (i + 1 < currentLevel.length) {
                    const left = currentLevel[i];
                    const right = currentLevel[i + 1];
                    nextLevel.push(this.hashPair(left, right));
                } else {
                    // Odd number of leaves, promote the last one
                    nextLevel.push(currentLevel[i]);
                }
            }
            this.levels.push(nextLevel);
            currentLevel = nextLevel;
        }
    }

    private hashPair(a: string, b: string): string {
        // Enforce sorted pairing (lexicographical order)
        // This allows verification without knowing left/right position
        const sorted = [a, b].sort();
        const buffer = Buffer.concat([
            Buffer.from(sorted[0], 'hex'),
            Buffer.from(sorted[1], 'hex'),
        ]);
        return createHash('sha256').update(buffer).digest('hex');
    }

    public getRoot(): string {
        if (this.levels.length === 0) return '';
        return this.levels[this.levels.length - 1][0];
    }

    public getProof(leaf: string): string[] {
        const index = this.leaves.indexOf(leaf);
        if (index === -1) throw new Error('Leaf not found');

        const proof: string[] = [];
        let currentIndex = index;

        for (let i = 0; i < this.levels.length - 1; i++) {
            const level = this.levels[i];
            const isRightNode = currentIndex % 2 === 1;
            const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

            if (siblingIndex < level.length) {
                proof.push(level[siblingIndex]);
            }

            currentIndex = Math.floor(currentIndex / 2);
        }

        return proof;
    }

    public static verify(leaf: string, proof: string[], root: string): boolean {
        let computedHash = leaf;

        for (const proofElement of proof) {
            const sorted = [computedHash, proofElement].sort();
            const buffer = Buffer.concat([
                Buffer.from(sorted[0], 'hex'),
                Buffer.from(sorted[1], 'hex'),
            ]);
            computedHash = createHash('sha256').update(buffer).digest('hex');
        }

        return computedHash === root;
    }
}
