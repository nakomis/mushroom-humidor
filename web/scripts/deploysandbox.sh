BUCKET_NAME=$(aws s3 ls --profile nakom.is-sandbox| grep mushroomcloudfrontstack-mushroombucket | awk '{ print $3 }')
npm run build && cd build && aws s3 sync . s3://$BUCKET_NAME --delete --profile nakom.is-sandbox && cd -
