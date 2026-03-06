import { ListTermsData, ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListTerms(options?: useDataConnectQueryOptions<ListTermsData>): UseDataConnectQueryResult<ListTermsData, undefined>;
export function useListTerms(dc: DataConnect, options?: useDataConnectQueryOptions<ListTermsData>): UseDataConnectQueryResult<ListTermsData, undefined>;

export function useListGradesByStudentAndTerm(vars: ListGradesByStudentAndTermVariables, options?: useDataConnectQueryOptions<ListGradesByStudentAndTermData>): UseDataConnectQueryResult<ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables>;
export function useListGradesByStudentAndTerm(dc: DataConnect, vars: ListGradesByStudentAndTermVariables, options?: useDataConnectQueryOptions<ListGradesByStudentAndTermData>): UseDataConnectQueryResult<ListGradesByStudentAndTermData, ListGradesByStudentAndTermVariables>;
