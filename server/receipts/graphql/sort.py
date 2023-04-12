from django.db.models import F

def sort_dataset(dataset, sortby):
    sort_fields = []
    for field in sortby:
        if field.startswith("-"):
            sort_fields.append(F(field[1:]).desc(nulls_last=True))
        else:
            sort_fields.append(F(field).asc(nulls_last=True))
    dataset = dataset.order_by(*sort_fields)

    return dataset
