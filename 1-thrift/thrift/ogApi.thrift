exception BadUrl {
}

exception CannotConnect {
}

exception HttpFailure {
    1: required i32 errorCode;
}

service OgService {
  OgResult parse(1:string url) throws
    (1:HttpFailure httpFailure, 2:CannotConnect cannotConnect,
        3:BadUrl badUrl);
}

struct OgResult {
    1: optional string title;
    2: optional string type;
    3: optional string image;
    4: optional string url;
    5: required list<string> visitedUrls;
}

