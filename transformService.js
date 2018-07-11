import {
    processAsset,
    processEntry,
    processRelationship,
} from "./contentfulTransform";

const transformServiceFactory = (contentful, neo4j, contentfulBatchSize) => {

    // This is the main entry point
    const copyContentfulSpaceToNeo4j = () => {
        fetchAssets(0);
    }

    const fetchAssets = (skip) => {
        
        const handleAssets = assets => processAssets(assets, contentfulBatchSize, skip);
        
        const handleFailure = reason => {
            console.log(`Fetch assets failed with ${reason}`);
            process.exit(1);
        };

        contentful.getAssets(contentfulBatchSize, skip)
            .then(handleAssets, handleFailure);
    };

    const processAssets = (assets, skip) => {
        console.log("Assets:", assets.items.length);
        
        assets.items.forEach(asset => processAsset(neo4j, asset));

        if ((skip + contentfulBatchSize) < assets.total) {
            fetchAssets(contentfulBatchSize, skip + contentfulBatchSize);
        }
        else {
            fetchEntries(0);
        }
    }

    const fetchEntries = (skip) => {
        const handleEntries = entries => processEntries(entries, skip);

        const handleFailure = reason => {
            console.log(`Fetch entries failed with ${reason}`);
            process.exit(1);
        };

        contentful.getEntries(contentfulBatchSize, skip)
            .then(handleEntries, handleFailure);
    }

    const processEntries = (entries, skip) => {
        console.log("Entries:", entries.items.length);

        entries.items.forEach((entry) => {
            processEntry(neo4j, storeRelationship, entry); 
        });

        if ((skip + contentfulBatchSize) < entries.total) {
            fetchEntries(skip + contentfulBatchSize);
        } else {
            processRelationships();
        }
    }

    let relationships = [];

    const storeRelationship = (data) => {
        relationships.push(data)
    }

    const processRelationships = () => {
        console.log("We found " + relationships.length + " relationships")

        relationships.forEach(relationship => {
            processRelationship(neo4j, relationship);
        });
        neo4j.finish();
    }

    return {
        copyContentfulSpaceToNeo4j,
        // The following are exposed for testing
        processAssets,
        processEntries,
        processRelationships,
        storeRelationship,
        fetchAssets,
        fetchEntries
    }
};

export default transformServiceFactory;

