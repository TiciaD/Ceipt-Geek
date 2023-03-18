import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  DateTime: any;
  DecimalType: any;
  Upload: any;
};

export type CreateReceipt = {
  __typename?: 'CreateReceipt';
  receipt?: Maybe<ReceiptType>;
};

export type CreateTag = {
  __typename?: 'CreateTag';
  tag?: Maybe<TagType>;
};

export type CreateUser = {
  __typename?: 'CreateUser';
  user?: Maybe<UserType>;
};

export type DeleteReceipt = {
  __typename?: 'DeleteReceipt';
  success?: Maybe<Scalars['Boolean']>;
};

export type DeleteTag = {
  __typename?: 'DeleteTag';
  success?: Maybe<Scalars['Boolean']>;
};

export type DeleteUser = {
  __typename?: 'DeleteUser';
  success?: Maybe<Scalars['Boolean']>;
};

export type LoginMutation = {
  __typename?: 'LoginMutation';
  success?: Maybe<Scalars['Boolean']>;
  token?: Maybe<Scalars['String']>;
};

export type LogoutMutation = {
  __typename?: 'LogoutMutation';
  success?: Maybe<Scalars['Boolean']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createReceipt?: Maybe<CreateReceipt>;
  createTag?: Maybe<CreateTag>;
  createUser?: Maybe<CreateUser>;
  deleteReceipt?: Maybe<DeleteReceipt>;
  deleteTag?: Maybe<DeleteTag>;
  deleteUser?: Maybe<DeleteUser>;
  login?: Maybe<LoginMutation>;
  logout?: Maybe<LogoutMutation>;
  updateReceipt?: Maybe<UpdateReceipt>;
  updateTag?: Maybe<UpdateTag>;
  updateUser?: Maybe<UpdateUser>;
};


export type MutationCreateReceiptArgs = {
  receiptData: ReceiptInput;
};


export type MutationCreateTagArgs = {
  tagName: Scalars['String'];
};


export type MutationCreateUserArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationDeleteReceiptArgs = {
  receiptId: Scalars['ID'];
};


export type MutationDeleteTagArgs = {
  id: Scalars['ID'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationUpdateReceiptArgs = {
  receiptData: ReceiptInput;
  receiptId: Scalars['ID'];
};


export type MutationUpdateTagArgs = {
  id: Scalars['ID'];
  tagName: Scalars['ID'];
};


export type MutationUpdateUserArgs = {
  email?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
  username?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  allReceipts?: Maybe<Array<Maybe<ReceiptType>>>;
  allReceiptsByUser?: Maybe<Array<Maybe<ReceiptType>>>;
  allTags?: Maybe<Array<Maybe<TagType>>>;
  allUsers?: Maybe<Array<Maybe<UserType>>>;
  filteredReceipts?: Maybe<Array<Maybe<ReceiptType>>>;
  getUser?: Maybe<UserType>;
  receipt?: Maybe<ReceiptType>;
  tag?: Maybe<TagType>;
  totalExpenditureByDate?: Maybe<Scalars['Float']>;
  user?: Maybe<UserType>;
};


export type QueryAllReceiptsArgs = {
  userId?: InputMaybe<Scalars['ID']>;
};


export type QueryFilteredReceiptsArgs = {
  costGte?: InputMaybe<Scalars['DecimalType']>;
  costLte?: InputMaybe<Scalars['DecimalType']>;
  dateGte?: InputMaybe<Scalars['Date']>;
  dateLte?: InputMaybe<Scalars['Date']>;
  expense?: InputMaybe<Scalars['String']>;
  notes?: InputMaybe<Scalars['String']>;
  storeName?: InputMaybe<Scalars['String']>;
  tagsContainsAll?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  tagsContainsAny?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  taxGte?: InputMaybe<Scalars['DecimalType']>;
  taxLte?: InputMaybe<Scalars['DecimalType']>;
};


export type QueryGetUserArgs = {
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
};


export type QueryReceiptArgs = {
  receiptId: Scalars['ID'];
};


export type QueryTagArgs = {
  id: Scalars['ID'];
};


export type QueryTotalExpenditureByDateArgs = {
  dateGte: Scalars['Date'];
  dateLte: Scalars['Date'];
};

export type ReceiptInput = {
  cost: Scalars['DecimalType'];
  date: Scalars['Date'];
  expense: Scalars['String'];
  notes?: InputMaybe<Scalars['String']>;
  receiptImage?: InputMaybe<Scalars['Upload']>;
  storeName: Scalars['String'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  tax: Scalars['DecimalType'];
};

export type ReceiptType = {
  __typename?: 'ReceiptType';
  cost?: Maybe<Scalars['DecimalType']>;
  date: Scalars['Date'];
  expense: ReceiptsReceiptExpenseChoices;
  id: Scalars['ID'];
  notes?: Maybe<Scalars['String']>;
  receiptImage?: Maybe<Scalars['String']>;
  storeName: Scalars['String'];
  tags: Array<TagType>;
  tax?: Maybe<Scalars['DecimalType']>;
  user: UserType;
};

export type ReceiptsReceiptExpenseChoices =
  /** Child Care */
  | 'CHILD_CARE'
  /** Clothing */
  | 'CLOTHING'
  /** Debt Repayment */
  | 'DEBT_REPAYMENT'
  /** Education */
  | 'EDUCATION'
  /** Emergency Fund */
  | 'EMERGENCY_FUND'
  /** Entertainment */
  | 'ENTERTAINMENT'
  /** Food */
  | 'FOOD'
  /** Gifts */
  | 'GIFTS'
  /** Healthcare */
  | 'HEALTHCARE'
  /** Housing */
  | 'HOUSING'
  /** Investments */
  | 'INVESTMENTS'
  /** Large Purchases */
  | 'LARGE_PURCHASES'
  /** Legal */
  | 'LEGAL'
  /** Memberships and Subscriptions */
  | 'MEMBERSHIPS_AND_SUBSCRIPTIONS'
  /** Other */
  | 'OTHER'
  /** Personal Care */
  | 'PERSONAL_CARE'
  /** Pet Care */
  | 'PET_CARE'
  /** Phone */
  | 'PHONE'
  /** Savings */
  | 'SAVINGS'
  /** Taxes */
  | 'TAXES'
  /** Transportation */
  | 'TRANSPORTATION'
  /** Travel */
  | 'TRAVEL'
  /** Utilities */
  | 'UTILITIES';

export type TagType = {
  __typename?: 'TagType';
  id: Scalars['ID'];
  receiptSet: Array<ReceiptType>;
  tagName: Scalars['String'];
};

export type UpdateReceipt = {
  __typename?: 'UpdateReceipt';
  receipt?: Maybe<ReceiptType>;
};

export type UpdateTag = {
  __typename?: 'UpdateTag';
  tag?: Maybe<TagType>;
};

export type UpdateUser = {
  __typename?: 'UpdateUser';
  user?: Maybe<UserType>;
};

export type UserType = {
  __typename?: 'UserType';
  dateJoined: Scalars['DateTime'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  /** Designates whether this user should be treated as active. Unselect this instead of deleting accounts. */
  isActive: Scalars['Boolean'];
  /** Designates whether the user can log into this admin site. */
  isStaff: Scalars['Boolean'];
  /** Designates that this user has all permissions without explicitly assigning them. */
  isSuperuser: Scalars['Boolean'];
  lastLogin?: Maybe<Scalars['DateTime']>;
  lastName: Scalars['String'];
  receiptSet: Array<ReceiptType>;
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: Scalars['String'];
};

export type CreateAccountMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
}>;


export type CreateAccountMutation = { __typename?: 'Mutation', createUser?: { __typename?: 'CreateUser', user?: { __typename?: 'UserType', username: string, email: string } | null } | null, login?: { __typename?: 'LoginMutation', token?: string | null, success?: boolean | null } | null };

export type AuthMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type AuthMutation = { __typename?: 'Mutation', login?: { __typename?: 'LoginMutation', token?: string | null, success?: boolean | null } | null };

export type AllReceiptsByUserQueryVariables = Exact<{ [key: string]: never; }>;


export type AllReceiptsByUserQuery = { __typename?: 'Query', allReceiptsByUser?: Array<{ __typename?: 'ReceiptType', id: string, storeName: string, cost?: any | null, date: any, expense: ReceiptsReceiptExpenseChoices, tags: Array<{ __typename?: 'TagType', id: string, tagName: string }> } | null> | null };

export type TotalExpenditureByDateQueryVariables = Exact<{
  dateGte: Scalars['Date'];
  dateLte: Scalars['Date'];
}>;


export type TotalExpenditureByDateQuery = { __typename?: 'Query', totalExpenditureByDate?: number | null };


export const CreateAccountDocument = gql`
    mutation CreateAccount($email: String!, $password: String!, $username: String!) {
  createUser(email: $email, password: $password, username: $username) {
    user {
      username
      email
    }
  }
  login(email: $email, password: $password) {
    token
    success
  }
}
    `;
export type CreateAccountMutationFn = Apollo.MutationFunction<CreateAccountMutation, CreateAccountMutationVariables>;

/**
 * __useCreateAccountMutation__
 *
 * To run a mutation, you first call `useCreateAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAccountMutation, { data, loading, error }] = useCreateAccountMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      username: // value for 'username'
 *   },
 * });
 */
export function useCreateAccountMutation(baseOptions?: Apollo.MutationHookOptions<CreateAccountMutation, CreateAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAccountMutation, CreateAccountMutationVariables>(CreateAccountDocument, options);
      }
export type CreateAccountMutationHookResult = ReturnType<typeof useCreateAccountMutation>;
export type CreateAccountMutationResult = Apollo.MutationResult<CreateAccountMutation>;
export type CreateAccountMutationOptions = Apollo.BaseMutationOptions<CreateAccountMutation, CreateAccountMutationVariables>;
export const AuthDocument = gql`
    mutation auth($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    success
  }
}
    `;
export type AuthMutationFn = Apollo.MutationFunction<AuthMutation, AuthMutationVariables>;

/**
 * __useAuthMutation__
 *
 * To run a mutation, you first call `useAuthMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAuthMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [authMutation, { data, loading, error }] = useAuthMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useAuthMutation(baseOptions?: Apollo.MutationHookOptions<AuthMutation, AuthMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AuthMutation, AuthMutationVariables>(AuthDocument, options);
      }
export type AuthMutationHookResult = ReturnType<typeof useAuthMutation>;
export type AuthMutationResult = Apollo.MutationResult<AuthMutation>;
export type AuthMutationOptions = Apollo.BaseMutationOptions<AuthMutation, AuthMutationVariables>;
export const AllReceiptsByUserDocument = gql`
    query AllReceiptsByUser {
  allReceiptsByUser {
    id
    storeName
    cost
    date
    expense
    tags {
      id
      tagName
    }
  }
}
    `;

/**
 * __useAllReceiptsByUserQuery__
 *
 * To run a query within a React component, call `useAllReceiptsByUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllReceiptsByUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllReceiptsByUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllReceiptsByUserQuery(baseOptions?: Apollo.QueryHookOptions<AllReceiptsByUserQuery, AllReceiptsByUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllReceiptsByUserQuery, AllReceiptsByUserQueryVariables>(AllReceiptsByUserDocument, options);
      }
export function useAllReceiptsByUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllReceiptsByUserQuery, AllReceiptsByUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllReceiptsByUserQuery, AllReceiptsByUserQueryVariables>(AllReceiptsByUserDocument, options);
        }
export type AllReceiptsByUserQueryHookResult = ReturnType<typeof useAllReceiptsByUserQuery>;
export type AllReceiptsByUserLazyQueryHookResult = ReturnType<typeof useAllReceiptsByUserLazyQuery>;
export type AllReceiptsByUserQueryResult = Apollo.QueryResult<AllReceiptsByUserQuery, AllReceiptsByUserQueryVariables>;
export const TotalExpenditureByDateDocument = gql`
    query TotalExpenditureByDate($dateGte: Date!, $dateLte: Date!) {
  totalExpenditureByDate(dateGte: $dateGte, dateLte: $dateLte)
}
    `;

/**
 * __useTotalExpenditureByDateQuery__
 *
 * To run a query within a React component, call `useTotalExpenditureByDateQuery` and pass it any options that fit your needs.
 * When your component renders, `useTotalExpenditureByDateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTotalExpenditureByDateQuery({
 *   variables: {
 *      dateGte: // value for 'dateGte'
 *      dateLte: // value for 'dateLte'
 *   },
 * });
 */
export function useTotalExpenditureByDateQuery(baseOptions: Apollo.QueryHookOptions<TotalExpenditureByDateQuery, TotalExpenditureByDateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TotalExpenditureByDateQuery, TotalExpenditureByDateQueryVariables>(TotalExpenditureByDateDocument, options);
      }
export function useTotalExpenditureByDateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TotalExpenditureByDateQuery, TotalExpenditureByDateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TotalExpenditureByDateQuery, TotalExpenditureByDateQueryVariables>(TotalExpenditureByDateDocument, options);
        }
export type TotalExpenditureByDateQueryHookResult = ReturnType<typeof useTotalExpenditureByDateQuery>;
export type TotalExpenditureByDateLazyQueryHookResult = ReturnType<typeof useTotalExpenditureByDateLazyQuery>;
export type TotalExpenditureByDateQueryResult = Apollo.QueryResult<TotalExpenditureByDateQuery, TotalExpenditureByDateQueryVariables>;
export type CreateReceiptKeySpecifier = ('receipt' | CreateReceiptKeySpecifier)[];
export type CreateReceiptFieldPolicy = {
	receipt?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CreateTagKeySpecifier = ('tag' | CreateTagKeySpecifier)[];
export type CreateTagFieldPolicy = {
	tag?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CreateUserKeySpecifier = ('user' | CreateUserKeySpecifier)[];
export type CreateUserFieldPolicy = {
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteReceiptKeySpecifier = ('success' | DeleteReceiptKeySpecifier)[];
export type DeleteReceiptFieldPolicy = {
	success?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteTagKeySpecifier = ('success' | DeleteTagKeySpecifier)[];
export type DeleteTagFieldPolicy = {
	success?: FieldPolicy<any> | FieldReadFunction<any>
};
export type DeleteUserKeySpecifier = ('success' | DeleteUserKeySpecifier)[];
export type DeleteUserFieldPolicy = {
	success?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LoginMutationKeySpecifier = ('success' | 'token' | LoginMutationKeySpecifier)[];
export type LoginMutationFieldPolicy = {
	success?: FieldPolicy<any> | FieldReadFunction<any>,
	token?: FieldPolicy<any> | FieldReadFunction<any>
};
export type LogoutMutationKeySpecifier = ('success' | LogoutMutationKeySpecifier)[];
export type LogoutMutationFieldPolicy = {
	success?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('createReceipt' | 'createTag' | 'createUser' | 'deleteReceipt' | 'deleteTag' | 'deleteUser' | 'login' | 'logout' | 'updateReceipt' | 'updateTag' | 'updateUser' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	createReceipt?: FieldPolicy<any> | FieldReadFunction<any>,
	createTag?: FieldPolicy<any> | FieldReadFunction<any>,
	createUser?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteReceipt?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteTag?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteUser?: FieldPolicy<any> | FieldReadFunction<any>,
	login?: FieldPolicy<any> | FieldReadFunction<any>,
	logout?: FieldPolicy<any> | FieldReadFunction<any>,
	updateReceipt?: FieldPolicy<any> | FieldReadFunction<any>,
	updateTag?: FieldPolicy<any> | FieldReadFunction<any>,
	updateUser?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('allReceipts' | 'allReceiptsByUser' | 'allTags' | 'allUsers' | 'filteredReceipts' | 'getUser' | 'receipt' | 'tag' | 'totalExpenditureByDate' | 'user' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	allReceipts?: FieldPolicy<any> | FieldReadFunction<any>,
	allReceiptsByUser?: FieldPolicy<any> | FieldReadFunction<any>,
	allTags?: FieldPolicy<any> | FieldReadFunction<any>,
	allUsers?: FieldPolicy<any> | FieldReadFunction<any>,
	filteredReceipts?: FieldPolicy<any> | FieldReadFunction<any>,
	getUser?: FieldPolicy<any> | FieldReadFunction<any>,
	receipt?: FieldPolicy<any> | FieldReadFunction<any>,
	tag?: FieldPolicy<any> | FieldReadFunction<any>,
	totalExpenditureByDate?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ReceiptTypeKeySpecifier = ('cost' | 'date' | 'expense' | 'id' | 'notes' | 'receiptImage' | 'storeName' | 'tags' | 'tax' | 'user' | ReceiptTypeKeySpecifier)[];
export type ReceiptTypeFieldPolicy = {
	cost?: FieldPolicy<any> | FieldReadFunction<any>,
	date?: FieldPolicy<any> | FieldReadFunction<any>,
	expense?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	notes?: FieldPolicy<any> | FieldReadFunction<any>,
	receiptImage?: FieldPolicy<any> | FieldReadFunction<any>,
	storeName?: FieldPolicy<any> | FieldReadFunction<any>,
	tags?: FieldPolicy<any> | FieldReadFunction<any>,
	tax?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type TagTypeKeySpecifier = ('id' | 'receiptSet' | 'tagName' | TagTypeKeySpecifier)[];
export type TagTypeFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	receiptSet?: FieldPolicy<any> | FieldReadFunction<any>,
	tagName?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateReceiptKeySpecifier = ('receipt' | UpdateReceiptKeySpecifier)[];
export type UpdateReceiptFieldPolicy = {
	receipt?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateTagKeySpecifier = ('tag' | UpdateTagKeySpecifier)[];
export type UpdateTagFieldPolicy = {
	tag?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateUserKeySpecifier = ('user' | UpdateUserKeySpecifier)[];
export type UpdateUserFieldPolicy = {
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserTypeKeySpecifier = ('dateJoined' | 'email' | 'firstName' | 'id' | 'isActive' | 'isStaff' | 'isSuperuser' | 'lastLogin' | 'lastName' | 'receiptSet' | 'username' | UserTypeKeySpecifier)[];
export type UserTypeFieldPolicy = {
	dateJoined?: FieldPolicy<any> | FieldReadFunction<any>,
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	firstName?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	isActive?: FieldPolicy<any> | FieldReadFunction<any>,
	isStaff?: FieldPolicy<any> | FieldReadFunction<any>,
	isSuperuser?: FieldPolicy<any> | FieldReadFunction<any>,
	lastLogin?: FieldPolicy<any> | FieldReadFunction<any>,
	lastName?: FieldPolicy<any> | FieldReadFunction<any>,
	receiptSet?: FieldPolicy<any> | FieldReadFunction<any>,
	username?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StrictTypedTypePolicies = {
	CreateReceipt?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CreateReceiptKeySpecifier | (() => undefined | CreateReceiptKeySpecifier),
		fields?: CreateReceiptFieldPolicy,
	},
	CreateTag?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CreateTagKeySpecifier | (() => undefined | CreateTagKeySpecifier),
		fields?: CreateTagFieldPolicy,
	},
	CreateUser?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CreateUserKeySpecifier | (() => undefined | CreateUserKeySpecifier),
		fields?: CreateUserFieldPolicy,
	},
	DeleteReceipt?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteReceiptKeySpecifier | (() => undefined | DeleteReceiptKeySpecifier),
		fields?: DeleteReceiptFieldPolicy,
	},
	DeleteTag?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteTagKeySpecifier | (() => undefined | DeleteTagKeySpecifier),
		fields?: DeleteTagFieldPolicy,
	},
	DeleteUser?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | DeleteUserKeySpecifier | (() => undefined | DeleteUserKeySpecifier),
		fields?: DeleteUserFieldPolicy,
	},
	LoginMutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LoginMutationKeySpecifier | (() => undefined | LoginMutationKeySpecifier),
		fields?: LoginMutationFieldPolicy,
	},
	LogoutMutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | LogoutMutationKeySpecifier | (() => undefined | LogoutMutationKeySpecifier),
		fields?: LogoutMutationFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	ReceiptType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ReceiptTypeKeySpecifier | (() => undefined | ReceiptTypeKeySpecifier),
		fields?: ReceiptTypeFieldPolicy,
	},
	TagType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | TagTypeKeySpecifier | (() => undefined | TagTypeKeySpecifier),
		fields?: TagTypeFieldPolicy,
	},
	UpdateReceipt?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateReceiptKeySpecifier | (() => undefined | UpdateReceiptKeySpecifier),
		fields?: UpdateReceiptFieldPolicy,
	},
	UpdateTag?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateTagKeySpecifier | (() => undefined | UpdateTagKeySpecifier),
		fields?: UpdateTagFieldPolicy,
	},
	UpdateUser?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateUserKeySpecifier | (() => undefined | UpdateUserKeySpecifier),
		fields?: UpdateUserFieldPolicy,
	},
	UserType?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserTypeKeySpecifier | (() => undefined | UserTypeKeySpecifier),
		fields?: UserTypeFieldPolicy,
	}
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;