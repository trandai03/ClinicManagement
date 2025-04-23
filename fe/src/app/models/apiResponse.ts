export type apiResponse<T> = {
    body: BlobPart;
    status: String,
    message: String,
    data: T;
}