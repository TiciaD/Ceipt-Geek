from rest_framework.pagination import PageNumberPagination
from urllib.parse import urlparse, parse_qs
from rest_framework.response import Response
import math, re


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'first': self.get_first_link(),
                'last': self.get_last_link()
            },
            'results': data
        })

    def get_first_link(self):
        if self.get_next_link() is None and self.get_previous_link() is None:
            return None
        else:
            url = self.request.build_absolute_uri()
            print(url)
            if "page=" in url:
                return re.sub(r'page=\d+', 'page=1', url)
            else:
                if "?" in url:
                    return f"{url}&page=1"
                else:
                    return f"{url}?page=1"


    def get_last_link(self):
        if self.get_next_link() is None and self.get_previous_link() is None:
            return None
        else:
            count = self.page.paginator.count
            url = self.request.build_absolute_uri()
            parsed = urlparse(url)
            query_params = parse_qs(parsed.query)
            page_size = query_params.get("page_size")
            if page_size is None:
                last_page = math.ceil(count / self.page_size)
                if "page=" in url:
                    return re.sub(r'page=\d+', f'page={last_page}', url)
                else:
                    if "?" in url:
                        return f"{url}&page={last_page}"
                    else:
                        return f"{url}?page={last_page}"
            else:
                page_size = int(page_size[0])
                last_page = math.ceil(count / page_size)
                if "page=" in url:
                    return re.sub(r'page=\d+', f'page={last_page}', url)
                else:
                    if "?" in url:
                        return f"{url}&page={last_page}"
                    else:
                        return f"{url}?page={last_page}"
