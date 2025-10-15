from msm.apiserver.site.handlers import (
    enroll,
    images,
    report,
)

ROUTERS = (
    enroll.v1_router,
    report.v1_router,
    images.v1_router,
)
