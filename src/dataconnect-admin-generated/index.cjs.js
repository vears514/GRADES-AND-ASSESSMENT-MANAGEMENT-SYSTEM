const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'example',
  serviceId: 'grades-and-assessment-management-system',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

function listTerms(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListTerms', undefined, inputOpts);
}
exports.listTerms = listTerms;

function listGradesByStudentAndTerm(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListGradesByStudentAndTerm', inputVars, inputOpts);
}
exports.listGradesByStudentAndTerm = listGradesByStudentAndTerm;

