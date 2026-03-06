import { ConnectorConfig, DataConnect, QueryRef, QueryPromise } from 'firebase/data-connect';

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

interface ListTermsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListTermsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListTermsData, undefined>;
  operationName: string;
}
export const listTermsRef: ListTermsRef;

export function listTerms(): QueryPromise<ListTermsData, undefined>;
export function listTerms(dc: DataConnect): QueryPromise<ListTermsData, undefined>;

interface ListGradesByStudentAndTermRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListGradesByStudentAndTermVariables): QueryRef<ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListGradesByStudentAndTermVariables): QueryRef<ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables>;
  operationName: string;
}
export const listGradesByStudentAndTermRef: ListGradesByStudentAndTermRef;

export function listGradesByStudentAndTerm(vars: ListGradesByStudentAndTermVariables): QueryPromise<ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables>;
export function listGradesByStudentAndTerm(dc: DataConnect, vars: ListGradesByStudentAndTermVariables): QueryPromise<ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables>;

