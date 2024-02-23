import boto3
import json
import re

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    # Check if the event is an S3 event
    print("==========STARTING===========")
    user_pool_name = "WildRydesUserPool"
    user_pool_client_name = "WildRydesWebApp"
    user_pool_id = get_user_pool_id_by_name(user_pool_name)
    user_pool_client_id = get_user_pool_client_id(user_pool_id, user_pool_client_name)
    vlauseToModify = {"userPoolId": user_pool_id,"userPoolClientId": user_pool_client_id,"region":event['Records'][0]["awsRegion"]}

    # Get bucket name and object key from the event
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    object_key = event['Records'][0]['s3']['object']['key']
    print(bucket_name,object_key)
    
    # Check if the object added is the desired config.js file
    if object_key == 'js/config.js':
        print("config.js was added")
        config_content = get_file_content(bucket_name, object_key)
        print("current config content:", config_content)
        

        for key in vlauseToModify.keys():
            config_content = re.sub(rf"{key}:.*?,", f"{key}:" + "'"+f'{vlauseToModify[key]}'+"'" + ",", config_content)
        print(config_content)
        put_file_content(bucket_name, object_key, config_content)
    print("==========ENDING===========")

        


def get_file_object(bucket_name, object_key):
    s3_resource = boto3.resource('s3', region_name='us-west-1')
    file_object = s3_resource.Object(bucket_name, object_key)
    return file_object


def get_file_content(bucket_name, object_key):
    file_object = get_file_object(
        bucket_name=bucket_name,
        object_key=object_key
    )
    return file_object.get()['Body'].read().decode('utf-8')


def put_file_content(bucket_name, object_key, content):
    file_object = get_file_object(
        bucket_name=bucket_name,
        object_key=object_key
    )
    file_object.put(Body=content)

def get_user_pool_id_by_name(user_pool_name):
    # Initialize the Cognito Identity Provider client
    cognito_client = boto3.client('cognito-idp')
    print("here")
    try:
        # Retrieve a list of user pools associated with the AWS account
        response = cognito_client.list_user_pools(MaxResults=60)  # MaxResults defaults to 60
        print(response)
        for user_pool in response['UserPools']:
            if user_pool['Name'] == user_pool_name:
                user_pool_id = user_pool['Id']
                return user_pool_id
                

    except Exception as e:
        print("Error:", e)
        return None
        
def get_user_pool_client_id(user_pool_id, user_pool_client_name):
    # Initialize the Cognito Identity Provider client
    cognito_client = boto3.client('cognito-idp')
    try:
        # Retrieve a list of user pools associated with the AWS account
        response = cognito_client.list_user_pool_clients(UserPoolId=user_pool_id)
        print(response)
        for client in response['UserPoolClients']:
            if client['ClientName'] == user_pool_client_name:
                user_pool_client_id = client['ClientId']
                return user_pool_client_id
                

    except Exception as e:
        print("Error:", e)
        return None