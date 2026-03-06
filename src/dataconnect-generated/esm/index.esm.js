import { queryRef, executeQuery, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'grades-and-assessment-management-system',
  location: 'us-east4'
};

export const listTermsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTerms');
}
listTermsRef.operationName = 'ListTerms';

export function listTerms(dc) {
  return executeQuery(listTermsRef(dc));
}

export const listGradesByStudentAndTermRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListGradesByStudentAndTerm', inputVars);
}
listGradesByStudentAndTermRef.operationName = 'ListGradesByStudentAndTerm';

export function listGradesByStudentAndTerm(dcOrVars, vars) {
  return executeQuery(listGradesByStudentAndTermRef(dcOrVars, vars));
}

