export interface ISearchState {
  loading: boolean;
  data: ISearchData[] | null;
  error: any;
}

export interface ISearchData {
  sickCd: string;
  sickNm: string;
}

export type ISearchAction =
  | { type: "LOADING" }
  | { type: "SUCCESS"; data: ISearchData[] | null }
  | { type: "ERROR"; error: any };

export function searchReducer(state: ISearchState, action: ISearchAction) {
  switch (action.type) {
    case "LOADING":
      return {
        loading: true,
        data: null,
        error: null,
      };
    case "SUCCESS":
      return {
        loading: false,
        data: action.data,
        error: null,
      };
    case "ERROR":
      return {
        loading: false,
        data: null,
        error: action.error,
      };
    default:
      throw new Error("처리되지 않은 타입입니다.");
  }
}
