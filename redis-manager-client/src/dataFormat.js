//card structure
/*
 * 각 카드는 Sorted Set을 이용하여 저장됨
 * Key: ..
 * Scrore: 1 (카드의 순서)
 * value: value1 
 * 
 * type: single의 경우 사용되는 dataType명시
 * 
 * type: multi의 경우 특정 키를 검색하여 해당되는 결과들을 산출
 * 예를들어 user:seq:*:nane, user:seq:*:test, ...
 * 키타입은 searchString에서 검색
 */

 let value1 = {
    title: 'user key mornitor',
    sec: 5,
    auto: true,
    type: 'single',
    searchString: 'user:seq'
 }

 //선택 가능한 리스트를 키 검색을 통해 만들어냄 'user:seq:*',
 //키타입은 searchString에서 검색
 let value2 = {
    title: 'user key pattern mornitor',
    sec: 5,
    auto: true,
    type: 'multi',
    searchString: 'user:seq:*'
 }
 /**
    +--
    | 1 번 | name   | bdt   | test  | 

    첫번째, 키에서 user:seq:* 가 포함된 것 찾기 (리스트확보) value3
    두번째, 리스트중 하나의 키로 검색하여 * 의 값들을 찾기 value4
    세번째, 찾은 * 값들을 이용하여 리스트로 역검색 value5
    네번째, 결과값들을 Json 포맷으로 변경 value6
  */

let value3 = [{
    key: 'user:seq:*:test',
    type: 'strings'   
}, {
    key: 'user:seq:*:name',
    type: 'set'
}, {
    key: 'user:seq:*:bdt',
    type: 'hash'
}];

let value4 = [
    1, 3, 4, 5, 6 ,7, 8, 9 
]

let value5 = {

}
