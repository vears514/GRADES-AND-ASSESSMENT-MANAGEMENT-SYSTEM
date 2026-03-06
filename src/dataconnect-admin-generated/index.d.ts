import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface Grade_Key {
  id: UUIDString;
  __typename?: 'Grade_Key';
}

export interface ListGradesByStudentAndTermData {
  grades: ({
    studentId: string;
    termId: string;
    subjectCode: string;
    subjectTitle: string;
    units: number;
    instructorName: string;
    gradeValue: string;
    remarks?: string | null;
    status: string;
    publishedAt?: TimestampString | null;
    publishedBy?: string | null;
  })[];
}

export interface ListGradesByStudentAndTermVariables {
  studentId: string;
  termId: string;
}

export interface ListTermsData {
  terms: ({
    id: string;
    name: string;
    startDate: TimestampString;
    endDate: TimestampString;
  } & Term_Key)[];
}

export interface Term_Key {
  id: string;
  __typename?: 'Term_Key';
}

/** Generated Node Admin SDK operation action function for the 'ListTerms' Query. Allow users to execute without passing in DataConnect. */
export function listTerms(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTermsData>>;
/** Generated Node Admin SDK operation action function for the 'ListTerms' Query. Allow users to pass in custom DataConnect instances. */
export function listTerms(options?: OperationOptions): Promise<ExecuteOperationResponse<ListTermsData>>;

/** Generated Node Admin SDK operation action function for the 'ListGradesByStudentAndTerm' Query. Allow users to execute without passing in DataConnect. */
export function listGradesByStudentAndTerm(dc: DataConnect, vars: ListGradesByStudentAndTermVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListGradesByStudentAndTermData>>;
/** Generated Node Admin SDK operation action function for the 'ListGradesByStudentAndTerm' Query. Allow users to pass in custom DataConnect instances. */
export function listGradesByStudentAndTerm(vars: ListGradesByStudentAndTermVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListGradesByStudentAndTermData>>;

