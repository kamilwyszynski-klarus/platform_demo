TAG=v1.4 && docker buildx build --platform linux/amd64 -t platform:$TAG --load /Users/kamil/Repos/internal/platform_demo && docker tag platform:$TAG klarusplatform-dudde6bve2fcc6e2.azurecr.io/platform:$TAG && docker push klarusplatform-dudde6bve2fcc6e2.azurecr.io/platform:$TAG

docker buildx build --platform linux/amd64 -t platform:v1.1 --load /Users/kamil/Repos/internal/platform_demo
docker tag platform:v1.1 klarusplatform-dudde6bve2fcc6e2.azurecr.io/platform:v1.1
docker push klarusplatform-dudde6bve2fcc6e2.azurecr.io/platform:v1.1
