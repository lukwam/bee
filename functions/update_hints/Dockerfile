FROM python:3.12.8-slim

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt functions-framework

WORKDIR /workspace

COPY main.py main.py

CMD ["python", "main.py"]
