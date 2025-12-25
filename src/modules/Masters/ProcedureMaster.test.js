import {test, assert, expect} from 'vitest'
import Master from '@/modules/Masters/ProcedureMaster.js'

const master = new Master()

test('ツリー構造のチェック', () => {
  const categories = master.Categories()
  expect(categories.length).toBeGreaterThan(0)

  for(const category of categories) {
    const targets = master.Targets(category)
    expect(targets.length).toBeGreaterThan(0)

    for(const target of targets) {
      const items = master.Items(category, target)
      expect(items.length).toBeGreaterThan(0)
    }
  }
})

test('内容の整合性チェック', () => {
  const categories = master.Categories()

  const itemCollection = []
  for(const category of categories) {
    const targets = master.Targets(category)
    for(const target of targets) {
      const items = master.Items(category, target)
      expect(items.length).toBeGreaterThan(0)

      for(const item of items) {
        const index = itemCollection.findIndex(
          element => Master.parseItem(element) === Master.parseItem(item)
        )

        if (index === -1) {
          itemCollection.push(item)
        } else {
          // Step1
          // 同じ手術名の検索Kコードが違っていないか確認する
          const itemCode = (Master.parseItem(item, 'Code') || []).sort()
          const collectionCode = (Master.parseItem(itemCollection[index], 'Code') || []).sort()

          assert(itemCode.join(',') === collectionCode.join(','),
          'Kコードの不整合が見つかりました。\n' +
          `カテゴリ:${category} 対象臓器:${target} - ${Master.parseItem(item)}`
          )
        }
      }
    }
  }

  for(const item of itemCollection) {
    // Dittoについて検証する
    const ditto = Master.parseItem(item, 'Ditto')
    if (ditto) {
      for (const dittoItemText of ditto) {
        // Step 2-1 dittoで指定された手術名がマスタに存在するか確認する
        const dittoIndex = itemCollection.findIndex(
          element => Master.parseItem(element) === dittoItemText
        )

        assert(dittoIndex !== -1,
        'Dittoで指定された手術名がマスタに存在しません。\n' +
        `手術名:${Master.parseItem(item)} - Ditto:${dittoItemText}`
        )

        // Step 2-2 dittoで指定された手術もdittoを持っているかを確認する
        const dittoItem = itemCollection[dittoIndex]
        const dittoOfDitto = Master.parseItem(dittoItem, 'Ditto') || []

        assert(dittoOfDitto.length > 0,
        'Dittoで指定された手術がDittoを持っていません。\n' +
        `手術名:${Master.parseItem(item)} - Ditto:${dittoItemText}`
        )

        // Step 2-3 dittoで指定された手術との間で相互参照になっているか確認する
        assert(dittoOfDitto.includes(Master.parseItem(item)),
        'Dittoで指定された手術との間で相互参照になっていません。\n' +
        `手術名:${Master.parseItem(item)} - Ditto:${dittoItemText}`
        )
      }
    }
  }
})
