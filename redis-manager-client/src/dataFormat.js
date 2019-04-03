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
 */

 let value1 = {
    header: {
        title: 'user key mornitor',
        sec: 5,
        auto: true,
        type: 'single'
    },
    body: {
        searchString: 'user:seq',
        dataType: 'strings'
    }
 }
 let value2 = {
    searchString: 'user:seq:*',
    header: {
        title: 'user key pattern mornitor',
        sec: 5,
        auto: true,
        type: 'multi'
    },
    body: [{
        searchString: 'user:seq:*test',
        dataType: 'strings'
    }, {
        searchString: 'user:seq:*:name',
        dataType: 'hash'
    }, {
        searchString: 'user:seq:*:bdt',
        dataType: 'set'
    }]
 }