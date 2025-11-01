provider "aws" {
  region = "ap-south-1"
}

resource "aws_security_group" "docker_sg" {
  name        = "docker-sg"
  description = "Allow SSH access for Docker host"

  ingress = [
    {
      description      = "Allow SSH"
      from_port        = 22
      to_port          = 22
      protocol         = "tcp"
      cidr_blocks      = ["0.0.0.0/0"]
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      security_groups  = []
      self             = false
    }
  ]

  egress = [
    {
      description      = "Allow all outbound traffic"
      from_port        = 0
      to_port          = 0
      protocol         = "-1"
      cidr_blocks      = ["0.0.0.0/0"]
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      security_groups  = []
      self             = false
    }
  ]
}

resource "aws_instance" "docker_host" {
  ami                    = "ami-0f58b397bc5c1f2e8" # Ubuntu 22.04 LTS (ap-south-1)
  instance_type          = "t3.micro"
  key_name               = "legal"  # ✅ must match your AWS key pair name
  vpc_security_group_ids = [aws_security_group.docker_sg.id]

  user_data = <<-EOT
    #!/bin/bash
    apt update -y
    apt install -y docker.io git curl
    systemctl enable docker
    systemctl start docker
  EOT

  tags = {
    Name = "Docker-Host"
  }
}

output "docker_host_public_ip" {
  value = aws_instance.docker_host.public_ip
}