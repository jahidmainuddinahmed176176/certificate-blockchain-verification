function getProof(leaves, targetLeaf) {
    let layer = leaves;
    let proof = [];
    let index = leaves.findIndex(leaf => leaf === targetLeaf);
    
    while (layer.length > 1) {
        const pairIndex = index % 2 === 0 ? index + 1 : index - 1;
        
        if (pairIndex < layer.length) {
            proof.push(layer[pairIndex]);
        } else {
            proof.push(layer[index]);
        }
        
        const nextLayer = [];
        for (let i = 0; i < layer.length; i += 2) {
            const left = layer[i];
            const right = i + 1 < layer.length ? layer[i + 1] : left;
            // Match contract's ordering
            const combined = ethers.solidityPackedKeccak256(
                ['bytes32', 'bytes32'],
                [left, right]
            );
            nextLayer.push(combined);
        }
        
        layer = nextLayer;
        index = Math.floor(index / 2);
    }
    
    return proof;
}