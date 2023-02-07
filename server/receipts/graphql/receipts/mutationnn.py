import requests
import base64

filename = "shipReceipt.jpeg"

# check the file extension
if not filename.endswith(('.jpeg', '.jpg', '.png', '.gif', '.bmp')):
    print("Error: Not a valid image file.")
else:
    # open and process the file
    with open(filename, "rb") as f:
        file_content = f.read()
        encoded_file = base64.b64encode(file_content).decode('utf-8')

url = "http://127.0.0.1:8000/graphql/"

query = """
mutation ($file: Upload!) {
createReceipt(receiptData:{
    userId: "1",
    storeName: "Meijers",
    date: "2023-01-01",
    expense: "HOUSING",
    cost: 123,
    receiptImage: $file,
    notes: "Hello"
}) {
    receipt {
    storeName
    date
    expense
    cost
    receiptImage
    notes
    }
}
}
"""

# with open("shipReceipt.jpeg", "rb") as f:
#     file_content = f.read()

# encode the binary content as base64
encoded_file = base64.b64encode(file_content).decode('utf-8')

# extract the csrf token from the response cookies
response = requests.get(url)
csrftoken = response.cookies["csrftoken"]

headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": csrftoken
}

response = requests.post(url, json={'query': query, 'variables': {'file': encoded_file}}, headers=headers, cookies={"csrftoken": csrftoken})


print(response.text)
