#import <Foundation/Foundation.h>
#import "UploadEvent.h"
#import <AFNetworking/AFNetworking.h>
NS_ASSUME_NONNULL_BEGIN
@protocol FileUploaderDelegate <NSObject>
@optional
- (void)uploadManagerDidReceiveProgress:(float)progress forUpload:(NSString*)uploadId;
- (void)uploadManagerDidCompleteUpload:(UploadEvent*)event;
@end

@interface FileUploader : NSObject
@property (nonatomic, assign) NSInteger parallelUploadsLimit;
@property (nonatomic, strong) id<FileUploaderDelegate> delegate;
+ (instancetype)sharedInstance;
-(void)addUpload:(NSURL *)request uploadId:(NSString*)uploadId fileURL:(NSURL *)fileURL
         headers:(NSDictionary*)headers parameters:(NSDictionary*)parameters
         fileKey:(NSString*)fileKey completionHandler:(void (^)(NSError* error))handler;
-(void)removeUpload:(NSString*)uploadId;
-(void)acknowledgeEventReceived:(NSString*)eventId;
@end

NS_ASSUME_NONNULL_END