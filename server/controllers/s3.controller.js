const aws = require('aws-sdk');
const config = require('../config/index.config');

const region = 'sa-east-1';
const bucketName = 's3-bucket-files-storage';

const s3 = new aws.S3({
	accessKeyId: config.AWS_ACCESS_KEY_ID,
	secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
	region: region,
	signatureVersion: 'v4'
});

module.exports.generateUploadUrl = async () => {
	const fileName = `${Date.now()}-${Math.random()}`;
	const params = ({
		Bucket: bucketName,
		Key: fileName,
		Expires: 60
	});

	const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
	return uploadUrl;
}