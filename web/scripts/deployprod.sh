BUCKET_NAME=$(aws s3 ls --profile nakom.is-prod | grep mushroomcloudfrontstack-mushroombucket | awk '{ print $3 }')
npm run build && cd build && aws s3 sync . s3://$BUCKET_NAME --profile nakom.is-prod && cd -
