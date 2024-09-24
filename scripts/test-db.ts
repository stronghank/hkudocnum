import { testConnection, executeQuery } from '../src/lib/db.js';

async function runTests() {
  console.log('Testing database connection...');
  const isConnected = await testConnection();
  console.log('Database connection:', isConnected ? 'Successful' : 'Failed');

  if (isConnected) {
    console.log('Testing CRUD operations...');
    
    // Test Create
    const insertResult = await executeQuery(
      'INSERT INTO dbo.documents (staffUid, staffName, staffEmail, subject, documentNumber, createdAt, modifiedAt) VALUES (@param1, @param2, @param3, @param4, @param5, @param6, @param7)',
      ['testuid', 'Test User', 'test@hku.hk', 'Test Document', 'TEST-001', new Date(), new Date()]
    );
    console.log('Insert result:', insertResult);

    // Test Read
    const selectResult = await executeQuery('SELECT TOP 1 * FROM dbo.documents WHERE staffUid = @param1', ['testuid']);
    console.log('Select result:', selectResult);

    // Test Update
    const updateResult = await executeQuery('UPDATE dbo.documents SET subject = @param1, modifiedAt = @param2 WHERE staffUid = @param3', ['Updated Test Document', new Date(), 'testuid']);
    console.log('Update result:', updateResult);

    // Test Delete (optional, comment out if you don't want to delete test data)
    // const deleteResult = await executeQuery('DELETE FROM dbo.documents WHERE staffUid = @param1', ['testuid']);
    // console.log('Delete result:', deleteResult);
  }
}

runTests().catch(console.error);