from fastapi import FastAPI, UploadFile, File
from PIL import Image
import torch
import timm
from torchvision import transforms
import io

app = FastAPI()

classes = [
    "battery",
    "biological",
    "cardboard",
    "clothes",
    "glass",
    "metal",
    "paper",
    "plastic",
    "shoes",
    "trash"
]

print("Creating model...")

model = timm.create_model(
    "efficientnet_b0",
    pretrained=False,
    num_classes=10
)

print("Loading weights...")

model.load_state_dict(
    torch.load(
        "ecosort_model.pth",
        map_location="cpu"
    )
)

print("Model loaded successfully!")

model.eval()

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
])

@app.get("/")
def home():
    return {
        "message":"EcoSort AI ML Service Running"
    }

@app.post("/predict")
async def predict(
    image: UploadFile = File(...)
):
    image_bytes = await image.read()

    img = Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")

    img_tensor = transform(img)

    img_tensor = img_tensor.unsqueeze(0)

    with torch.no_grad():

        outputs = model(img_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence, predicted = torch.max(
            probabilities,
            dim=1
        )

        confidence_percent = round(
            confidence.item() * 100,
            2
        )
        predicted_class = classes[predicted.item()]

        return {
            "category": predicted_class,
            "confidence": confidence_percent
        }