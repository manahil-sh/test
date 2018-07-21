import mockNeo4jServiceFactory from "./mocks/mockNeo4jService";
import mockContentfulServiceFactory from "./mocks/mockContentfulService";
import transformServiceFactory from "./transformService";
import mockLogService from "./mocks/mockLogService";
import mockSystemServiceFactory from "./mocks/mockSystemService";

const contentfulBatchSize = 10;

test('Check Process Empty Entries Calls Relationships', (done) => {
  
    const contentfulService = mockContentfulServiceFactory();
    const neo4jService = mockNeo4jServiceFactory();
    const log = mockLogService();
    const systemService = mockSystemServiceFactory();

    const entries = {
        total: 0,
        items: []
    };
  
    contentfulService.getEntries.mockReturnValue( new Promise(() => contentfulService.emptyResult) );
 
    neo4jService.finish.mockReturnValue( new Promise( () => {
        done();
      } ));

    const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);
  
    transformService.processEntries(entries, 0);
  
    expect( neo4jService.finish.mock.calls.length).toEqual(1);
  } );
  

test('Check Process Entries Calls Fetch More', (done) => {

    const contentfulService = mockContentfulServiceFactory();
    const neo4jService = mockNeo4jServiceFactory();
    const log = mockLogService();
    const systemService = mockSystemServiceFactory();

    const entries = {
        total: 11,
        items: []
    };

    contentfulService.getEntries.mockReturnValue( new Promise(() => contentfulService.emptyResult) );
 
    neo4jService.finish.mockReturnValue( new Promise( () => {
        done();
      } ));

    const transformService = transformServiceFactory(contentfulService, neo4jService, contentfulBatchSize, log, systemService);
  
    transformService.processEntries(entries, 0);
  
    expect( contentfulService.getEntries.mock.calls.length).toEqual(1);

} );
