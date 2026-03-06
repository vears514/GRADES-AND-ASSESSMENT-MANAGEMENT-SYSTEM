const { queryRef, executeQuery, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'grades-and-assessment-management-system',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const listTermsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTerms');
}
listTermsRef.operationName = 'ListTerms';
exports.listTermsRef = listTermsRef;

exports.listTerms = function listTerms(dc) {
  return executeQuery(listTermsRef(dc));
};

const listGradesByStudentAndTermRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListGradesByStudentAndTerm', inputVars);
}
listGradesByStudentAndTermRef.operationName = 'ListGradesByStudentAndTerm';
exports.listGradesByStudentAndTermRef = listGradesByStudentAndTermRef;

exports.listGradesByStudentAndTerm = function listGradesByStudentAndTerm(dcOrVars, vars) {
  return executeQuery(listGradesByStudentAndTermRef(dcOrVars, vars));
};
